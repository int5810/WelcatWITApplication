/** @description �u���[�J�[�փX�L�����f�[�^���p�u���b�V������
 * @param {object} QueryString �N�G������
 * @param {string} host �z�X�g��
 * @param {number} port �|�[�g�ԍ�
 * @param {number} qos MQTT��QOS���x��
 * @param {boolean} retain MQTT��Reatin�ݒ�
 * @returns {undefined}
 */
function Publish2Broker(logger, QueryString, host, port = 1883, qos = 0, retain = false, ssl = false, key_file = null, cert_file = null, trusted_ca_list_file = null) {
    //���M�f�[�^�̒�`
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

    //MQTT�N���C�A���g�ڑ�
    const mqtt = require("mqtt");
    //�N���C�A���gID�͏d������ƁA�Â��ق����폜�����͗l
    //�f�t�H���g�ł̓����_���ȕ�����őΉ����Ă���
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
        //���͐ݒ肵���ق��������s��
        options["rejectUnauthorized"] = false;
        options["secureProtocol"] = "TLSv1_2_method";
        options["username"] = "username";
        options["password"] = "password";
    }
    else {
        options["protocol"] = "mqtt";
    }
    const client = mqtt.connect(options);

    //�����Ǝ��s�����Ɋւ��C�x���g
    client.on("end", function () {
        logger.info(host + " end");
        console.log(host + " end");
    });
    //���s�Ɋւ��C�x���g
    client.on("error", function (err) {
        logger.error(host + " error\n" + err);
        console.log(host + " error\n" + err);
    });
    client.on("offline", function () {
        logger.info(host + " offline");
        console.log(host + " offline");
        client.end();
    });

    //���b�Z�[�W���M
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