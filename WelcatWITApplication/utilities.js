/*
 * SQLite�n
 */
//SQLITE�t�@�C����
var _SQLITE_ASSETSFILENAME = "assetsdb.sqlite3";  //SQLite�I�u�W�F�N�g�t�@�C����
var _SQLITE_DATAFILENAME = "datadb.sqlite3";  //SQLite�I�u�W�F�N�g�t�@�C����
//assets�p�e�[�u����
var _SQLITE_SUBJECTTABLE = "subject";
var _SQLITE_PRODUCTTABLE = "product";
var _SQLITE_OPERATIONTABLE = "operation";
//data�p�e�[�u����
var _SQLITE_MASTERTABLE = "master";
var _SQLITE_DATASETTABLE = "dataset";
//�Ǘ���
var _ADMIN_NAME = "admin";
var _ADMIN_PW = "1234";

/*
 * MQTT�n
 */
var _MQTT_PUBLISHER = "192.168.137.1"; //"192.168.137.205";
var _MQTT_BROKER = "-";
var _SMETER_THRESHOLD = 2;  //�d�g���x�̍Œ�l�A���̒l�ȉ��͑��M���Ȃ�
var _LQMETER_THRESHOLD = 2; //�ʐM�i��
var _RETRY_PUBLISH = true;  //�ʐM�ł��Ȃ������ꍇ�̂�蒼���̗L��

/*
 * ID�n
 */
var id_subject;
var subject_name = (function () {
    var ret_name = "���[�U�[�s��";
    id_subject = -1;
    if (typeof QueryString["id_subject"] !== "undefined") {
        id_subject = parseInt(QueryString["id_subject"]);
    }
    //id_subject�̒l�ɉ����ă��[�U�[����ύX
    if (id_subject != -1) {
        var conn = wit.OpenDBConnection(_SQLITE_ASSETSFILENAME);
        if (typeof conn != "number") {
            var recordset = conn.Execute("SELECT name FROM " + _SQLITE_SUBJECTTABLE + " WHERE id = " + id_subject + ";");
            if (recordset.GetField(0) != null) {
                ret_name = recordset.GetField(0);
            }
            else {
                id_subject = -3;    // �v����ID��������Ȃ�
            }
            recordset.Close();
        }
        else {
            id_subject = -2;    // DB�t�@�C���ɃA�N�Z�X�ł��Ȃ�
        }
        conn.Close();
    }
    return ret_name;
})();

/*
 * ���̑�
 */
//url��name�̕������value��GET(or POST)���M����
//���̊֐��I�����window.unload���Ă΂��
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
        wit.MsgBox("SppOpen�G���[�F" + result);
        return;
    }
    //�ڑ�
    result = wit.SppSetRxBreakTime(10000);
    if (result !== 0) {
        wit.MsgBox("SppSetRxBreakTime�G���[�F" + result);
        wit.SppClose();
        return;
    }
    result = wit.SppSetTxBreakTime(10000);
    if (result !== 0) {
        wit.MsgBox("SppSetTxBreakTime�G���[�F" + result);
        wit.SppClose();
        return;
    }
    result = wit.SppConnect(0);
    if (result === -7) {
        wit.MsgBox("��M�v���O�����ƒʐM�ł��܂���B");
        wit.SppClose();
        return;
    }
    else if (result !== 0) {
        wit.MsgBox("SppConnect�G���[�F" + result);
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
    var stream = wit.OpenStream(filename, true);//�O�̃t�@�C���͈ꉞ�j���ŊJ��
    var finish_flag = false;
    while (!finish_flag) {
        //�ŏ��Ƀo�b�t�@�T�C�Y���󂯎��
        var buffer_size = parseInt(wit.SppRead(8), 10);
        //���Ƀo�b�t�@�̓��e���󂯎��
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
    wit.MsgBox("�t�@�C���̎�M���������܂���");
}

function print(message) {
    try {
        console.log(message);
    } catch (error) {
        wit.MsgBox(message);
    }
}