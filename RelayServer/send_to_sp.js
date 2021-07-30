/** @description 計測用スマホへデータを送信する
 * @param {string} host ホスト名
 * @param {number} port ポート番号
 * @param {object} QueryString クエリ辞書
 * @param {number} x X座標,NaNはparseFloat対応している,nullは0になる
 * @param {number} y Y座標
 * @param {number} z Z座標
 * @param {boolean} littleEndian リトルエンディアンかどうか
 * @returns {boolean}
 */
function Send2Smartphone(logger, host, port, x, y, z, QueryString, little_endian = false) {
    //送信元データ
    const header = ""; //"barcode";
    const id_subject = parseInt(QueryString["id_subject"]);
    const scan_ut = parseFloat(QueryString["scan_ut"]);

    //バイト文字列に変換
    const buffer = new ArrayBuffer(24); //0+4*4+8
    const dataView = new DataView(buffer);
    const header_bytes = (new TextEncoder("utf-8")).encode(header);
    const yaw = -10;    //-pi~piの範囲外
    for (let i = 0; i < header_bytes.byteLength; i++)
        dataView.setUint8(i, header_bytes[i]);
    dataView.setFloat32(header_bytes.byteLength, x, little_endian);
    dataView.setFloat32(header_bytes.byteLength + 4, y, little_endian);
    dataView.setFloat32(header_bytes.byteLength + 8, z, little_endian);
    dataView.setFloat32(header_bytes.byteLength + 12, yaw, little_endian);
    dataView.setFloat64(header_bytes.byteLength + 16, scan_ut, little_endian);
    console.log("<Send2Smartphone('" + host + "', " + id_subject + ", " + scan_ut + ", " + x + ", " + y + ", " + z + ")>");
    //socket接続+通信
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
    //ここからはtest
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
        client.end(new Uint8Array(buffer));   // writeだと接続が維持されてしまう
        const log_str = "<Send2Smartphone('" + host + "', " + id_subject + ", " + scan_ut + ", " + x + ", " + y + ", " + z + ")>";
        logger.info(log_str);
        console.log(log_str);
    });

    return true;    // timeoutの可能性は潰せていない
}

/** @description バーコードリーダーIDとスマホのホスト名の紐づけ辞書を作成する
 * @param {string} file_path 読込対象ファイルパス
 * @returns {object}
 */
async function CreateSmartphoneDictionary(file_path) {
    const fs = require("fs");
    const readline = require("readline");
    const dic = {};

    //csvファイル読み込み
    if (!fs.existsSync(file_path))
        return dic;
    const stream = fs.createReadStream(file_path);
    const lines = readline.createInterface({
        input: stream
    });

    //ループ処理
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