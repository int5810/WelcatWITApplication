"""概要(Summary line)

計測用スマホを模したTCP通信用サーバー

"""

import logging
import msvcrt
import socket
import sys
import time
import threading
from pdb import set_trace
from struct import pack, unpack, error as StructError

import numpy as np
import pandas as pd
if sys.version_info[0] < 3:
    from SocketServer import TCPServer as VirtualSmartphoneBaseServer, BaseRequestHandler as VirtualSmartphoneBaseRequestHandler
else:
    # from socketserver import TCPServer as VirtualSmartphoneBaseServer            # シングルスレッド
    from socketserver import ThreadingTCPServer as VirtualSmartphoneBaseServer   # マルチスレッド
    # from socketserver import ForkingTCPServer as VirtualSmartphoneBaseServer     # マルチプロセス,Unix版のみっぽい
    from socketserver import BaseRequestHandler as VirtualSmartphoneBaseRequestHandler

DEBUG_MODE = True


class VirtualSmartphoneRequestHandler(VirtualSmartphoneBaseRequestHandler):
    """概要(Summary line)

    VirtualSmartphoneServer用のハンドラクラス

    """

    # クラス変数
    __logger = logging.getLogger("VirtualSmartphoneServerHandler({})".format(__name__))
    __logger.setLevel(logging.DEBUG) # INFO
    __logger_handler = logging.StreamHandler()
    # __logger_handler = logging.FileHandler("test_server_handler.log")
    __logger_handler.setFormatter(logging.Formatter(" %(asctime)s - %(levelname)7s - [%(threadName)s]%(message)s"))
    __logger.addHandler(__logger_handler)

    def __init__(self, request, client_address, server):
        """概要(Summary line)

        コンストラクタ

        Parameters
        ----------
        request : socket.socket
            リクエスト内容
        client_address : tuple
            クライアントのホストとポート
        server : VirtualSmartphoneServer
            対象のサーバー

        """

        VirtualSmartphoneRequestHandler.__logger.debug("<VirtualSmartphoneRequestHandler.__init__()>")   # selfだとインスタンス側に隠ぺいすることがあるらしい
        self.__recv_buffer = b""
        VirtualSmartphoneBaseRequestHandler.__init__(self, request, client_address, server)

    def setup(self):
        """概要(Summary line)

        handle前のセットアップ

        Returns
        -------
        None
            返り値特になし

        """

        VirtualSmartphoneRequestHandler.__logger.debug("<VirtualSmartphoneRequestHandler.setup()>")
        VirtualSmartphoneRequestHandler.__logger.info(str(self.client_address) + " login")
        VirtualSmartphoneBaseRequestHandler.setup(self) # returnいらない

    def handle(self):
        """概要(Summary line)

        VirtualSmartphoneServer用のハンドラクラス

        Returns
        -------
        None
            返り値特になし

        """

        VirtualSmartphoneRequestHandler.__logger.debug("<VirtualSmartphoneRequestHandler.handle()>")
        connection_flag = True
        buffer_length = 1024
        test = True
        while connection_flag:
            try:
                data = self.request.recv(buffer_length)  # パーティクルデータを受け取るには少なそう
            except(ConnectionAbortedError): # クライアント側で突然切ってきた場合
                VirtualSmartphoneRequestHandler.__logger.warning("client_aborted:%s", self.client_address)
                break
            except(ConnectionResetError): # クライアント側で強制的に切られた場合（アプリ落ちとか）
                VirtualSmartphoneRequestHandler.__logger.warning("client_connection_reset:%s", self.client_address)
                break
            buffer_length = 1024
            if len(data) == 0:
                VirtualSmartphoneRequestHandler.__logger.warning("client_disconnect:%s", self.client_address)
                connection_flag = False
            else:
                self.__recv_buffer += data
                result, complete_data = self.__check_recv_buffer_length()
                if result:
                    continue
                if complete_data[:7] == b"barcode":
                    if server.set_barcode_pos(complete_data[7:]):
                        pass
                    else:
                        connection_flag = False
                elif complete_data[:5] == b"swioh": # サーバークローズとほぼイコールでは？
                    VirtualSmartphoneRequestHandler.__logger.info("shutdown_from_server:%s", self.client_address)
                    server.shutdown()
                    connection_flag = False
                elif complete_data[:4] == b"test":
                    server.test()
                else:
                    # VirtualSmartphoneRequestHandler.__logger.warning("unknown command receive:%s - %s", complete_data[0], self.client_address)
                    if server.set_barcode_pos(complete_data):
                        pass
                    else:
                        connection_flag = False
                if len(self.__recv_buffer) != 0 and test:
                    test = False
                    print("remain command", self.__recv_buffer[0])
                    print("remain data", self.__recv_buffer)

    def finish(self):
        """概要(Summary line)

        handle後の後処理

        Returns
        -------
        None
            返り値特になし

        """

        VirtualSmartphoneRequestHandler.__logger.debug("<VirtualSmartphoneRequestHandler.finish()>")
        VirtualSmartphoneBaseRequestHandler.finish(self) # returnいらない

    def __check_recv_buffer_length(self):
        """概要(Summary line)

        バッファデータの長さが適正か確認する

        Returns
        -------
        tuple
            bool(Trueならconitnueさせる)と必要分のbytes

        """

        buffer_length = len(self.__recv_buffer)
        if self.__recv_buffer[:5] == b"swioh":
            complete_data = self.__recv_buffer[:5]
            self.__recv_buffer = self.__recv_buffer[5:]
            return False, complete_data
        else:
            if buffer_length < 24:
                return True, b""
            complete_data = self.__recv_buffer[:24]
            self.__recv_buffer = self.__recv_buffer[24:]
            return False, complete_data

        return True, b""

    if DEBUG_MODE:
        @property
        def recv_buffer(self):
            return self.__recv_buffer


class VirtualSmartphoneServer(VirtualSmartphoneBaseServer):
    """概要(Summary line)

    オンライン処理のnSDF実行用クラス

    VirtualSmartphoneBaseServer : socketserver.BaseServer
        使用するサーバーのタイプ、import で切り替えられるようにする

    """

    if hasattr(VirtualSmartphoneBaseServer, "daemon_threads"):
        # サーバーに終了通知を出さなくていいなら
        VirtualSmartphoneBaseServer.daemon_threads = True

    def __init__(self, server_address, handler_class=VirtualSmartphoneRequestHandler, request_queue_size=10, timeout=5):
        """概要(Summary line)

        コンストラクタ

        Parameters
        ----------
        server_address : tuple
            ホストとポート
        handler_class : type
            ハンドラクラスタイプ

        """

        # サーバー系
        self.__logger = logging.getLogger("VirtualSmartphoneServer({})".format(__name__))
        self.__logger.setLevel(logging.DEBUG) # INFO
        self.__logger_handler = logging.StreamHandler()
        # self.__logger_handler = logging.FileHandler("test_server.log")
        self.__logger_handler.setFormatter(logging.Formatter(" %(asctime)s - %(levelname)7s - [%(threadName)s]%(message)s"))
        self.__logger.addHandler(self.__logger_handler)
        self.__logger.debug("<VirtualSmartphoneServer.__init__()>")
        VirtualSmartphoneBaseServer.__init__(self, server_address, handler_class)
        self.set_request_queue_size(request_queue_size)
        # 派生元の変数
        self.timeout = timeout
        # サーバー状況チェック用
        self.__is_active = True     # サーバーが稼働中かどうか
        self.__request_thread = None      # クライアントのリクエストを聞くためのループ用

    def server_activate(self):
        """概要(Summary line)

        サーバー側のコンストラクタ中に呼ばれる

        Returns
        -------
        None
            返り値特になし

        """

        self.__logger.debug("<VirtualSmartphoneServer.server_activate()>")
        super().server_activate()

    def serve_forever(self):
        """概要(Summary line)

        serve_actionsを呼んでループ処理を行う
        停める場合はshutdownを呼び出す

        Returns
        -------
        None
            返り値特になし

        """

        self.__logger.debug("<VirtualSmartphoneServer.serve_forever()>")
        self.__logger.info("Handling requests, press <Esc> to quit.")
        super().serve_forever()

    def service_actions(self):
        """概要(Summary line)

        serve_foreverに呼ばれるループ処理の内容

        Returns
        -------
        None
            返り値特になし

        """

        # self.__logger.debug("<VirtualSmartphoneServer.service_actions()>")    # うっとおしいので含めなくてもよさそう
        super().service_actions()

    def handle_request(self):
        """概要(Summary line)

        リクエストの処理

        Returns
        -------
        None
            返り値特になし

        """

        # self.__logger.debug("<VirtualSmartphoneServer.handle_request()>")    # うっとおしいので含めなくてもよさそう
        super().handle_request()

    def verify_request(self, request, client_address):
        """概要(Summary line)

        True の場合には要求が処理され、 False の場合には要求は拒否されます
        デフォルトでは常にTrueらしい、クライアントの制限をかけたりする?

        Parameters
        ----------
        request : socket.socket
            リクエスト内容
        client_address : tuple
            クライアントのホストとポート

        Returns
        -------
        bool
            要求の許可/不許可

        """

        self.__logger.debug("<VirtualSmartphoneServer.verify_request(request, %s)>", client_address)
        return super().verify_request(request, client_address)

    def process_request(self, request, client_address):
        """概要(Summary line)

        finish_requestを呼び出す
        マルチ化する場合はここで新たなプロセスかスレッドを生成し、ForkingMixInまたはThreadingMixInクラスに行わせる（らしい）
        ThreadingMixInを入れた場合、この関数はオーバーライドしてはいけないのでコメントアウトする

        Parameters
        ----------
        request : socket.socket
            リクエスト内容
        client_address : tuple
            クライアントのホストとポート

        Returns
        -------
        None
            返り値特になし

        """

        self.__logger.debug("<VirtualSmartphoneServer.process_request(request, %s)>", client_address)
        if hasattr(self, "_threads"):
            # 元モジュールからname指定を追加
            t = threading.Thread(name="'" + client_address[0] + "'",
                                 target=self.process_request_thread,
                                 args=(request, client_address))
            t.daemon = self.daemon_threads
            if not t.daemon and self.block_on_close:
                if self._threads is None:
                    self._threads = []
                self._threads.append(t)
            t.start()
        else:
            super().process_request(request, client_address)

    def shutdown(self):
        """概要(Summary line)

        serve_forever関数のループを止める際に呼び出す

        Returns
        -------
        None
            返り値特になし

        """

        self.__logger.debug("<VirtualSmartphoneServer.shutdown()>")
        super().shutdown()
        self.__request_thread.join()

    def server_close(self):
        """概要(Summary line)

        サーバをクリーンアップする

        Returns
        -------
        None
            返り値特になし

        """

        self.__logger.debug("<VirtualSmartphoneServer.server_close()>")
        self.__is_active = False
        super().server_close()

    def finish_request(self, request, client_address):
        """概要(Summary line)

        ハンドラクラスをインスタンス化して、handleメソッドを呼び出してリクエストを処理する

        Parameters
        ----------
        request : socket.socket
            リクエスト内容
        client_address : tuple
            クライアントのホストとポート

        Returns
        -------
        None
            返り値特になし

        """

        self.__logger.debug("<VirtualSmartphoneServer.finish_request(request, %s)>", client_address)
        super().finish_request(request, client_address)

    def shutdown_request(self, request):
        """概要(Summary line)

        Called to shutdown and close an individual request.

        Parameters
        ----------
        request : socket.socket
            リクエスト内容

        Returns
        -------
        None
            特になし

        """

        self.__logger.debug("<VirtualSmartphoneServer.shutdown_request(request)>")
        super().shutdown_request(request)

    def close_request(self, request):
        """概要(Summary line)

        ドキュメントに記載ないので、用途不明
        リクエスト内容の処理が終了したときに呼ばれる?

        Parameters
        ----------
        request : socket.socket
            リクエスト内容

        Returns
        -------
        None
            返り値特になし

        """

        self.__logger.debug("<VirtualSmartphoneServer.close_request(request)>")
        super().close_request(request)

    def handle_timeout(self):
        """概要(Summary line)

        マルチプロセス時のみ使用するらしい
        Called if no new request arrives within self.timeout.
        Overridden by ForkingMixIn.

        Returns
        -------
        None
            返り値特になし

        """

        # self.__logger.debug("<VirtualSmartphoneServer.handle_timeout()>")    # うっとおしいので含めなくてもよさそう
        super().handle_timeout()

    def handle_error(self, request, client_address):
        """概要(Summary line)

        ハンドラ内でエラー検知時に呼ばれる
        親クラスは標準出力しかしてないっぽいので、完全に書き換える

        Parameters
        ----------
        request : socket.socket
            リクエスト内容
        client_address : tuple
            クライアントのホストとポート

        Returns
        -------
        None
            特になし

        """

        self.__logger.debug("<VirtualSmartphoneServer.handle_error(request, %s)>", client_address)
        self.__logger.error("Exception happened during processing of request from %s.", client_address)
        import traceback
        traceback.print_exc()

    # ここからは自作関数

    @property
    def is_active(self):
        """概要(Summary line)

        サーバが稼働中かどうかを返す
        server_close呼出し後はFalse

        Returns
        -------
        bool
            サーバが稼働中かどうか

        """

        return self.__is_active

    @property
    def request_thread_is_alive(self):
        """概要(Summary line)

        リクエストスレッドが稼働中かどうかを返す

        Returns
        -------
        bool
            稼働状況

        """

        return self.__request_thread is not None and self.__request_thread.is_alive()

    def set_request_queue_size(self, request_queue_size):
        """概要(Summary line)

        request_queue_sizeのサイズを指定する

        Parameters
        ----------
        request_queue_size : int
            キュー数

        Returns
        -------
        None
            返り値特になし

        """

        self.__logger.debug("<VirtualSmartphoneServer.set_request_queue_size(%d)>", request_queue_size)
        self.request_queue_size = request_queue_size

    def set_timeout(self, timeout):
        """概要(Summary line)

        timeoutを指定する

        Parameters
        ----------
        request_queue_size : float
            タイムアウト時間（秒）

        Returns
        -------
        None
            返り値特になし

        """

        self.__logger.debug("<VirtualSmartphoneServer.set_timeout(%.3f)>", timeout)
        self.timeout = timeout

    def start_serve_forever(self):
        """概要(Summary line)

        リクエスト受付ループを開始する

        Returns
        -------
        None
            特になし

        """

        if self.__request_thread is None:
            self.__logger.debug("<VirtualSmartphoneServer.start_serve_forever()>")
            self.__request_thread = threading.Thread(name="RequestThread", target=self.serve_forever)
            self.__request_thread.start()

    def stop_serve_forever(self):
        """概要(Summary line)

        リクエスト受付ループを終了する

        Returns
        -------
        None
            特になし

        """

        if self.__request_thread is not None:
            self.__logger.debug("<VirtualSmartphoneServer.stop_serve_forever()>")
            self.__request_thread.join()
            self.__request_thread = None

    def set_barcode_pos(self, data):
        """概要(Summary line)

        バーコードのバイト文字列を分解する

        Parameters
        ----------
        data : bytes
            数値のバイト文字列

        Returns
        -------
        bool
            成功or失敗

        """

        try:
            x = bytes_to_float32(data[:4])
            y = bytes_to_float32(data[4:8])
            z = bytes_to_float32(data[8:12])
            yaw = bytes_to_float32(data[12:16])
            ts = bytes_to_float64(data[16:])
            self.__logger.info("ts:%s, x:%s, y:%s, z:%s, yaw:%s", ts, x, y, z, yaw)
            return True
        except:
            self.__logger.error("<VirtualSmartphoneServer.__init__()>")
            return False


def bytes_to_uint32(bytes_array, is_little=True):
    """概要(Summary line)

    バイト配列を4バイトの符号なし整数に変換する

    Parameters
    ----------
    bytes_array : bytes
        バイト配列

    Returns
    -------
    int or None
        整数

    """

    try:
        if is_little:
            return unpack("<I", bytes_array)[0]
        return unpack(">I", bytes_array)[0]
    except(StructError):
        return None


def bytes_to_float32(bytes_array, is_little=True):
    """概要(Summary line)

    バイト配列を単精度浮動小数に変換する

    Parameters
    ----------
    bytes_array : bytes
        バイト配列

    Returns
    -------
    numpy.float32 or None
        4バイトの単精度浮動小数

    """

    try:
        if is_little:
            return np.frombuffer(bytes_array, np.float32)[0]
        return np.frombuffer(bytes_array, np.dtype(np.float32).newbyteorder(">"))[0]
    except(ValueError):
        return None
    except(IndexError):
        return None


def bytes_to_float64(bytes_array, is_little=True):
    """概要(Summary line)

    バイト配列を倍精度浮動小数に変換する

    Parameters
    ----------
    bytes_array : bytes
        バイト配列

    Returns
    -------
    numpy.float64 or None
        8バイトの倍精度浮動小数

    """

    try:
        if is_little:
            return np.frombuffer(bytes_array, np.float64)[0]
        return np.frombuffer(bytes_array, np.dtype(np.float64).newbyteorder(">"))[0]
    except(ValueError):
        return None
    except(IndexError):
        return None


if __name__ == "__main__":
    def readchar_with_timeout(timeout_sec, timeout_code=b"0"):
        """概要(Summary line)

        時間制限付きキーボード1文字入力

        Parameters
        ----------
        timeout_sec : float
            入力待ち時間（秒）
        timeout_code : bytes
            時間切れ時に返す値

        Returns
        -------
        bytes
            入力コード

        """

        time_limit = time.time() + timeout_sec
        while time.time() < time_limit:
            if msvcrt.kbhit():
                c =  msvcrt.getwch()    # これは少しケアが必要そうだが、とりあえず放置
                return c.encode()
            time.sleep(0.05)    # 入れないと処理が重くなるらしい

        return timeout_code

    print("-Menu------------\n" +\
          " s : start/stop announce loop\n" +\
          "\n Tab : Trace (for Debug)\n" +\
          "\n Esc : close viewer\n" +\
          "-----------------")

    host = "150.82.226.250"  # socket.gethostbyname(socket.gethostname())
    port = 13001 # 24680    # 使用中の場合はOSErrorになる
    server_address = (host, port)
    try:
        # サーバー起動
        server = VirtualSmartphoneServer(server_address, VirtualSmartphoneRequestHandler)
    except(OSError):
        print("サーバーアドレスが無効")
        quit()
    server.set_timeout(5)
    server.start_serve_forever()
    timeout_code = b"0"
    key = timeout_code
    ESC = 0x1b.to_bytes(1, "big")
    while key != ESC:
        key = readchar_with_timeout(5, timeout_code)
        if key == timeout_code:
            if not server.is_active:    # サーバーがクローズ処理を行っていた場合
                break
            elif not server.request_thread_is_alive: # ループが止まっていた場合
                server.server_close()
                break
        elif key == b"s":
            if server.announce_flag:
                server.stop_announce()
            else:
                server.start_announce()
        elif DEBUG_MODE and key == b"\t":
            set_trace()
        elif key == ESC:
            server.shutdown()
            server.server_close()
