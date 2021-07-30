/** @description �v���p�X�}�z�փf�[�^�𑗐M����
 * @param {string} host �z�X�g��
 * @param {number} port �|�[�g�ԍ�
 * @param {object} QueryString �N�G������
 * @param {number} x X���W,NaN��parseFloat�Ή����Ă���,null��0�ɂȂ�
 * @param {number} y Y���W
 * @param {number} z Z���W
 * @param {boolean} littleEndian ���g���G���f�B�A�����ǂ���
 * @returns {boolean}
 */
function Send2Smartphone(logger, host, port, x, y, z, QueryString, little_endian = false) {
    //���M���f�[�^
    const header = ""; //"barcode";
    const id_subject = parseInt(QueryString["id_subject"]);
    const scan_ut = parseFloat(QueryString["scan_ut"]);

    //�o�C�g������ɕϊ�
    const buffer = new ArrayBuffer(24); //0+4*4+8
    const dataView = new DataView(buffer);
    const header_bytes = (new TextEncoder("utf-8")).encode(header);
    const yaw = -10;    //-pi~pi�͈̔͊O
    for (let i = 0; i < header_bytes.byteLength; i++)
        dataView.setUint8(i, header_bytes[i]);
    dataView.setFloat32(header_bytes.byteLength, x, little_endian);
    dataView.setFloat32(header_bytes.byteLength + 4, y, little_endian);
    dataView.setFloat32(header_bytes.byteLength + 8, z, little_endian);
    dataView.setFloat32(header_bytes.byteLength + 12, yaw, little_endian);
    dataView.setFloat64(header_bytes.byteLength + 16, scan_ut, little_endian);
    console.log("<Send2Smartphone('" + host + "', " + id_subject + ", " + scan_ut + ", " + x + ", " + y + ", " + z + ")>");
    //socket�ڑ�+�ʐM
    let net;
    try {
        net = require("net");
    } catch (e) {
        return false;
    }
    const client = new net.Socket();
    client.setEncoding("utf8");
    client.setTimeout(5000);
    client.on("connect", function () {
        logger.info(host + " connect");
        console.log(host + " connect");
    });
    client.on("close", function (hadError) {
        if (hadError) {
            logger.error(host + " close with Error(s)");
            console.log(host + " close with Error(s)");
        }
        else {
            logger.info(host + " correctly close");
            console.log(host + " correctly close");
        }
    });
    client.on("timeout", function () {
        client.destroy(new Error("forced close by timeout"));
        logger.info(host + " timeout");
        console.log(host + " timeout");
    });
    client.on("error", function (e) {
        logger.error(host + " error '" + e + "'");
        console.log(host + " error '" + e + "'");
    });
    //���������test
    client.on("data", function (data) {
        logger.info(host + " data '" + data + "'");
        console.log(host + " data '" + data + "'");
    });
    client.on("drain", function () {
        logger.info(host + " drain");
        console.log(host + " drain");
    });
    client.on("end", function () {
        logger.info(host + " end");
        console.log(host + " end");
    });
    client.on("lookup", function (err, address, family, host) {
        const lookup_str = host + " lookup 'err:" + err + " address:" + address + " family:" + family + " host:" + host + "'";
        logger.info(lookup_str);
        console.log(lookup_str);
    });
    client.on("ready", function (e) {
        logger.info(host + " ready");
        console.log(host + " ready");
    });

    client.connect(port, host, function () {
        client.end(new Uint8Array(buffer));   // write���Ɛڑ����ێ�����Ă��܂�
        const log_str = "<Send2Smartphone('" + host + "', " + id_subject + ", " + scan_ut + ", " + x + ", " + y + ", " + z + ")>";
        logger.info(log_str);
        console.log(log_str);
    });

    return true;    // timeout�̉\���ׂ͒��Ă��Ȃ�
}

/** @description �o�[�R�[�h���[�_�[ID�ƃX�}�z�̃z�X�g���̕R�Â��������쐬����
 * @param {string} file_path �Ǎ��Ώۃt�@�C���p�X
 * @returns {object}
 */
async function CreateSmartphoneDictionary(file_path) {
    const fs = require("fs");
    const readline = require("readline");
    const dic = {};

    //csv�t�@�C���ǂݍ���
    if (!fs.existsSync(file_path))
        return dic;
    const stream = fs.createReadStream(file_path);
    const lines = readline.createInterface({
        input: stream
    });

    //���[�v����
    let elements;
    for await (const line of lines) {
        elements = line.split(",");
        if (elements.length !== 2)
            break;
        dic[elements[0]] = elements[1];
    };
    return dic;
}

exports.Send2Smartphone = Send2Smartphone;
exports.CreateSmartphoneDictionary = CreateSmartphoneDictionary;