/** @description ブローカーへスキャンデータをパブリッシュする
 * @param {object} QueryString クエリ辞書
 * @param {string} host ホスト名
 * @param {number} port ポート番号
 * @param {number} qos MQTTのQOSレベル
 * @param {boolean} retain MQTTのReatin設定
 * @returns {undefined}
 */
function Publish2Broker(logger, QueryString, host, port = 1883, qos = 0, retain = false, ssl = false, key_file = null, cert_file = null, trusted_ca_list_file = null) {
    //送信データの定義
    if (Object.keys(QueryString).length === 0)
        return;
    const id_terminal = QueryString["id_terminal"];
    const id_terminal_in_exp = parseInt(id_terminal) - 72;
    const topic = "evt/barcode/" + id_terminal_in_exp + "/read";
    const id_subject = QueryString["id_subject"];
    const id_master = QueryString["id_master"];
    const scan_ut = QueryString["scan_ut"];
    const scan_code = QueryString["scan_code"];
    let log_str = "<Publish2Broker('" + host + "', '" + topic + "', '" + id_subject + "', '" + id_master + "', '" + scan_ut + "', '" + scan_code + "')>";
    logger.info(log_str);
    console.log(log_str);

    //MQTTクライアント接続
    const mqtt = require("mqtt");
    //クライアントIDは重複すると、古いほうが削除される模様
    //デフォルトではランダムな文字列で対応している
    let options = {
        host: host,
        port: port,
        connectTimeout: 10000
    };
    if (ssl && key_file != null && cert_file != null && trusted_ca_list_file != null) {
        const fs = require("fs");
        options["protocol"] = "mqtts";
        options["key"] = fs.readFileSync(key_file);
        options["cert"] = fs.readFileSync(cert_file);
        options["ca"] = fs.readFileSync(trusted_ca_list_file);
        //↓は設定したほうがいか不明
        options["rejectUnauthorized"] = false;
        options["secureProtocol"] = "TLSv1_2_method";
        options["username"] = "username";
        options["password"] = "password";
    }
    else {
        options["protocol"] = "mqtt";
    }
    const client = mqtt.connect(options);

    //成功と失敗両方に関わるイベント
    client.on("end", function () {
        logger.info(host + " end");
        console.log(host + " end");
    });
    //失敗に関わるイベント
    client.on("error", function (err) {
        logger.error(host + " error\n" + err);
        console.log(host + " error\n" + err);
    });
    client.on("offline", function () {
        logger.info(host + " offline");
        console.log(host + " offline");
        client.end();
    });

    //メッセージ送信
    client.on("connect", function (connack) {
        console.log(host + " connect");
        const id_location = QueryString["product_name"];
        const message = '{"reader":' + id_terminal_in_exp +
                        ',"barcode":"' + id_location +
                        '","timestamp":' + scan_ut + '}';
        const publish_options = {
            qos: qos,
            retain: retain
        };
        client.publish(topic, message, publish_options, function (err) {
            if (err === undefined) {
                logger.info(topic + " publish");
                console.log(topic + " publish");
            }
            else {
                logger.error(topic + " publish_err\n" + err);
                console.log(topic + " publish_err\n" + err);
            }
        });
        client.end();
    });
}

exports.Publish2Broker = Publish2Broker;