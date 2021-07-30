"""概要(Summary line)

3列のcsvファイルをもとに
バーコードの乱数を付与したcsvファイルを作成する

Example
-------
python create_csv.py srcfile [dstfile]

"""

import time

import numpy as np


def give_barcode_value(srcfile="testdata.csv", dstfile="pos.csv"):
    """概要(Summary line)

    csvファイルにバーコードの乱数を付与する
    出力されるファイルはproductlist.csvとしても使えるようにする
    productlist.csvは最後の行がEofのみでないと最後の有効な行が飛ばされるので注意

    Parameters
    ----------
    srcfile : str
        入力csvファイル名
    dstfile : str
        出力csvファイル名

    Returns
    -------
    int
        バーコードの付与の成功(0)or失敗

    """

    np.random.seed(0)   # int(time.time())
    # ファイルの読み込み
    csv_data = []
    z = "0.0"
    try:
        with open(srcfile, "r") as fr:
            line = fr.readline()    # ヘッダー読み飛ばし
            line = fr.readline()
            while line:
                line_split = line[:-1].split(",")
                csv_data.append([line_split[1], line_split[2], z, line_split[0]])   # x,y,z,label
                line = fr.readline()
    except:
        return 1
    # 行数の取得
    len_data = len(csv_data)
    # バーコードデータの作成
    if False:
        # 乱数
        barcode_values = np.empty(0, dtype=np.uint64)
        while len(barcode_values) < len_data:
            add_barcode_values = np.random.randint(0xfffff+1, size=len_data-len(barcode_values), dtype=np.uint64)   # とりあえず16進数で5桁
            barcode_values = np.append(barcode_values, add_barcode_values)
            barcode_values = np.unique(barcode_values)
            barcode_values = barcode_values[np.random.choice(len(barcode_values), size=len(barcode_values), replace=False)]
    else:
        # ただの昇順
        barcode_values = np.arange(len_data, dtype=np.uint64)
    # csvへ出力
    try:
        with open(dstfile, "w") as fw:
            for csv_row, barcode_value in zip(csv_data, barcode_values):
                barcode = hex(barcode_value)[2:].upper()
                # barcode += __get_check_digit(barcode) # スペースあると分かりづらいので割愛
                fw.write("{},{},{},{},{}\n".format(csv_row[0], csv_row[1], csv_row[2], "AIST" + str(barcode).zfill(4), csv_row[3]))  # x,y,z,barcode,label
                # fw.write("{},{}\n".format("AIST" + str(barcode).zfill(4), csv_row[3]))  # productlist.csv用
    except:
        return 2

    return 0


def __check_header(csvfile):
    """概要(Summary line)

    csvファイルにヘッダーがあるか確認する

    Parameters
    ----------
    csvfile: str
        ファイルパス

    Returns
    -------
    list or None
        ヘッダーの文字列、失敗時はNone

    """

    # 最初の1行読み取り
    try:
        with open(csvfile, "r") as fr:
            line = fr.readline()
    except:
        return None
    if line[-1] == "\n":
        line = line[:-1]

    return line.split(",")


def __get_check_digit(barcode):
    """概要(Summary line)

    をcode39の数値に変換する

    Parameters
    ----------
    char : str
        1文字

    Returns
    -------
    str
        バーコードのCD、1文字、失敗は空文字

    """

    cd = ""
    sum = 0 # 各文字に対応する数値の総和
    for char in barcode:
        value = __convert_char_to_code39num(char)
        if value == -1:
            raise Exception
        sum += value

    cd = __convert_code39num_to_char(sum % 43)

    return cd


def __convert_char_to_code39num(char):
    """概要(Summary line)

    文字をcode39の数値に変換する

    Parameters
    ----------
    char : str
        1文字

    Returns
    -------
    int
        code39での数値(0~42)、失敗は-1

    """

    # charのチェック
    if type(char)!= str or len(char) != 1:
        return -1

    # 数値
    try:
        num = int(char)
        return num
    except(ValueError):
        pass

    # アルファベット
    ascii_num = ord(char)
    if ascii_num >= 65 and ascii_num <= 90: # A~Z
        return ascii_num - 55
    if ascii_num >= 97 and ascii_num <= 122:    # a~z
        return ascii_num - 87

    # 記号
    if char == "-":
        return 36
    if char == ".":
        return 37
    if char == " ":
        return 38
    if char == "$":
        return 39
    if char == "/":
        return 40
    if char == "+":
        return 41
    if char == "%":
        return 42

    return -1   # ダメなとき


def __convert_code39num_to_char(num, is_lower=False):
    """概要(Summary line)

    code39の数値を文字に変換する

    Parameters
    ----------
    num : int
        code39での数値、0～42
    is_upper : bool
        アルファベット時に大文字で返すならTrue

    Returns
    -------
    int
        code39での数値(0~42)、失敗は空文字

    """

    # numのチェック
    if type(num) != int or num < 0 or num > 42:
        return ""

    # 記号
    if num == 36:
        return "-"
    if num == 37:
        return "."
    if num == 38:
        return " "
    if num == 39:
        return "$"
    if num == 40:
        return "/"
    if num == 41:
        return "+"
    if num == 42:
        return "%"

    # 数値
    if num >= 0 and num <= 9:
        return str(num)

    # アルファベット
    if num >= 10 and num <= 35:
        if is_lower:
            return chr(num + 87)
        return chr(num + 55)

    return ""   # ダメなとき