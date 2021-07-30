/*
 * SQLite系
 */
//SQLITEファイル名
var _SQLITE_ASSETSFILENAME = "assetsdb.sqlite3";  //SQLiteオブジェクトファイル名
var _SQLITE_DATAFILENAME = "datadb.sqlite3";  //SQLiteオブジェクトファイル名
//assets用テーブル名
var _SQLITE_SUBJECTTABLE = "subject";
var _SQLITE_PRODUCTTABLE = "product";
var _SQLITE_OPERATIONTABLE = "operation";
//data用テーブル名
var _SQLITE_MASTERTABLE = "master";
var _SQLITE_DATASETTABLE = "dataset";
//管理者
var _ADMIN_NAME = "admin";
var _ADMIN_PW = "1234";

/*
 * MQTT系
 */
var _MQTT_PUBLISHER = "192.168.137.1"; //"192.168.137.205";
var _MQTT_BROKER = "-";
var _SMETER_THRESHOLD = 2;  //電波強度の最低値、この値以下は送信しない
var _LQMETER_THRESHOLD = 2; //通信品質
var _RETRY_PUBLISH = true;  //通信できなかった場合のやり直しの有無

/*
 * ID系
 */
var id_subject;
var subject_name = (function () {
    var ret_name = "ユーザー不明";
    id_subject = -1;
    if (typeof QueryString["id_subject"] !== "undefined") {
        id_subject = parseInt(QueryString["id_subject"]);
    }
    //id_subjectの値に応じてユーザー名を変更
    if (id_subject != -1) {
        var conn = wit.OpenDBConnection(_SQLITE_ASSETSFILENAME);
        if (typeof conn != "number") {
            var recordset = conn.Execute("SELECT name FROM " + _SQLITE_SUBJECTTABLE + " WHERE id = " + id_subject + ";");
            if (recordset.GetField(0) != null) {
                ret_name = recordset.GetField(0);
            }
            else {
                id_subject = -3;    // 計測者IDが見つからない
            }
            recordset.Close();
        }
        else {
            id_subject = -2;    // DBファイルにアクセスできない
        }
        conn.Close();
    }
    return ret_name;
})();

/*
 * その他
 */
//urlにnameの文字列でvalueをGET(or POST)送信する
//この関数終了後にwindow.unloadが呼ばれる
function SendForm(url, param_array) {
    var form = document.createElement("form");
    document.body.appendChild(form);
    for (var key in param_array) {
        var input = document.createElement("input");
        input.setAttribute("type", "hidden");
        input.setAttribute("name", key);
        input.setAttribute("value", param_array[key]);
        form.appendChild(input);
    }
    form.setAttribute("action", url);
    form.setAttribute("method", "post or get");
    form.submit();
}

function ReceiveFile() {
    var result = wit.SppOpen(true);
    if (result !== 0) {
        wit.MsgBox("SppOpenエラー：" + result);
        return;
    }
    //接続
    result = wit.SppSetRxBreakTime(10000);
    if (result !== 0) {
        wit.MsgBox("SppSetRxBreakTimeエラー：" + result);
        wit.SppClose();
        return;
    }
    result = wit.SppSetTxBreakTime(10000);
    if (result !== 0) {
        wit.MsgBox("SppSetTxBreakTimeエラー：" + result);
        wit.SppClose();
        return;
    }
    result = wit.SppConnect(0);
    if (result === -7) {
        wit.MsgBox("受信プログラムと通信できません。");
        wit.SppClose();
        return;
    }
    else if (result !== 0) {
        wit.MsgBox("SppConnectエラー：" + result);
        wit.SppClose();
        return;
    }

    var filename_size = parseInt(wit.SppRead(3), 10);
    var filename = "";
    var filename_buffer = wit.SppRead(filename_size * 4);
    while (filename_buffer.length >= 4) {
        var char_str = filename_buffer.substring(0, 4);
        filename += String.fromCharCode(parseInt(char_str, 16));
        filename_buffer = filename_buffer.substring(4);
    }
    var stream = wit.OpenStream(filename, true);//前のファイルは一応破棄で開く
    var finish_flag = false;
    while (!finish_flag) {
        //最初にバッファサイズを受け取る
        var buffer_size = parseInt(wit.SppRead(8), 10);
        //次にバッファの内容を受け取る
        buffer = wit.SppRead(buffer_size * 4);
        var strtest = "";
        while (buffer.length >= 4) {
            var char_str = buffer.substring(0, 4);
            strtest += String.fromCharCode(parseInt(char_str, 16));
            buffer = buffer.substring(4);
            if (char_str === "001A")
                finish_flag = true;
        }
        if (finish_flag)
            strtest = strtest.substring(0, strtest.length - 1);
        stream.Write(strtest);
        //wit.SppWrite("OK");
    }
    stream.Close();
    wit.SppDisconnect();
    wit.SppClose();
    wit.MsgBox("ファイルの受信が完了しました");
}

function print(message) {
    try {
        console.log(message);
    } catch (error) {
        wit.MsgBox(message);
    }
}