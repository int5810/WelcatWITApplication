(async function () {
    console.log("Push 'Ctrl + C' to finish");

    //ロガー作成
    const log4js = require("log4js");
    log4js.configure({
        appenders: {
            RelayServer: {
                type: "file",
                filename: "server.log"
            }
        },
        categories: {
            default: {
                appenders: ["RelayServer"],
                level: "info"
            },
        }
    });
    const logger = log4js.getLogger("RelayServer");

    //自作ライブラリのインポート
    let Publish2Broker;
    let Send2Smartphone, CreateSmartphoneDictionary;
    //let CreateBarcodeDictionary;
    //let CreateOrderDictionary, GetFirstLocation, CheckOrder, GetNextLocation;
    let setting;
    try {
        Publish2Broker = require("./publish_to_mqtt_broker").Publish2Broker;
    } catch (e) {
        console.log(e);
    }
    try {
        Send2Smartphone = require("./send_to_sp").Send2Smartphone;
        CreateSmartphoneDictionary = require("./send_to_sp").CreateSmartphoneDictionary
    } catch (e) {
        console.log(e);
    }
    /*try {
        CreateBarcodeDictionary = require("./convert_code_to_pos").CreateBarcodeDictionary;
    } catch (e) {
        console.log(e);
    }*/
    /*try {
        CreateOrderDictionary = require("./manage_order_list").CreateOrderDictionary;
        GetFirstLocation = require("./manage_order_list").GetFirstLocation;
        CheckOrder = require("./manage_order_list").CheckOrder;
        GetNextLocation = require("./manage_order_list").GetNextLocation;
    } catch (e) {
        console.log(e);
    }*/
    try {
        setting = require("./setting");
    } catch (e) {
        console.log(e);
        process.exit(1);
    }

    //コードと位置の辞書を作成
    /*let barcode_dic;
    if (CreateBarcodeDictionary !== undefined) {
        barcode_dic = await CreateBarcodeDictionary(setting.POS_DIC);
    }*/

    //バーコードリーダーとスマホの辞書を作成
    let sp_dic;
    if (CreateSmartphoneDictionary !== undefined) {
        sp_dic = await CreateSmartphoneDictionary(setting.SP_DIC);
    }

    //ワーカーのオーダーの辞書を作成
    /*let order_dic;
    if (CreateOrderDictionary !== undefined) {
        order_dic = await CreateOrderDictionary(setting.ORDER_DIC);
    }
    let working_index_dic = {};
    working_index_dic["104"] = 0;
    working_index_dic["68309"] = 0;
    working_index_dic["73250"] = 0;
    working_index_dic["79841"] = 0;
    working_index_dic["95032"] = 0;
    working_index_dic["95078"] = 0;
    working_index_dic["0"] = 0;*/

    //HTTPサーバーの起動
    let http = require("http");
    let server = http.createServer();
    server.on("request", function (req, res) {
        
        // (debug)リクエスト内容を確認
        /*console.log("-----");
        console.log("url:" + req.url);
        console.log("req.aborted:" + req.aborted);
        console.log("req.complete:" + req.complete);
        console.log("req.headers['host']:" + req.headers['host']);
        console.log("req.headers['connection']:" + req.headers['connection']);
        console.log("req.headers['cache-control']:" + req.headers['cache-control']);
        console.log("req.headers['accept']:" + req.headers['accept']);
        console.log("req.headers['upgrade-insecure-requests']:" + req.headers['upgrade-insecure-requests']);
        console.log("req.headers['user-agent']:" + req.headers['user-agent']);
        console.log("req.headers['accept-encoding']:" + req.headers['accept-encoding']);
        console.log("req.headers['accept-language']:" + req.headers['accept-language']);
        console.log("req.headers['origin']:" + req.headers['origin']);
        console.log("req.httpVersion:" + req.httpVersion);
        console.log("req.method:" + req.method);
        console.log("req.rawHeaders:" + req.rawHeaders);
        console.log("req.rawTrailers:" + req.rawTrailers);
        console.log("req.socket:" + req.socket);
        console.log("req.statusCode:" + req.statusCode);
        console.log("req.trailers:" + req.trailers);
        console.log("req.statusMessage:" + req.statusMessage);*/

        //クエリ文字列の取得
        const QueryString = (function (req_url) {
            let query, queryItems, queryItem,
                i, length, key, value, params = {};

            query = req_url.split('?')[1];
            if (query === undefined)
                return params;
            query = query.split('#')[0];
            queryItems = query.split('&');

            for (let i = 0, length = queryItems.length; i < length; i++) {
                queryItem = (queryItems[i]).split('=');
                key = queryItem[0];
                value = queryItem[1];
                params[key] = value;
            }

            return params;
        })(req.url);
        console.log(QueryString);
        logger.info("get query " + JSON.stringify(QueryString));
        const id_terminal = QueryString["id_terminal"];
        if (Object.keys(QueryString).length === 2) {
            console.log(QueryString["id_subject"] + " by " + id_terminal + " login");
            logger.info(QueryString["id_subject"] + " by " + id_terminal + " login");
            const first_location = "helo world"; //GetFirstLocation(order_dic, String(parseInt(id_terminal) - 71));
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.write(first_location);
            res.end();
            return;
        }

        //MQTTのパブリッシュ
        if (Publish2Broker !== undefined) {
            Publish2Broker(logger, QueryString, setting.MQTT_BROKER);
        }

        //スマホへ送信
        if (Send2Smartphone !== undefined) {
            const sp_host = sp_dic[id_terminal]; //送信先スマホ
            if (sp_host !== undefined && QueryString["x"] !== undefined && QueryString["y"] !== undefined) {
                const x = parseFloat(QueryString["x"]);
                const y = parseFloat(QueryString["y"]);
                let z;
                if (QueryString["z"] === undefined)
                    z = 0.0;
                else
                    z = parseFloat(QueryString["z"]);
                if (Send2Smartphone(logger, sp_host, setting.SP_PORT, x, y, z, QueryString, true))
                    console.log("Send to sp");
                else
                    console.log("Not send to sp");
            }
            
        }

        //次の移動先指示を取得
        let next_location = "helo world";  //Unknown
        /*if (order_dic !== undefined) {
            let worker_id = "0";
            if (id_terminal === "72")
                worker_id = setting.TERMINAL0_WORKERID;
            else if (id_terminal === "73")
                worker_id = setting.TERMINAL1_WORKERID;
            else if (id_terminal === "74")
                worker_id = setting.TERMINAL2_WORKERID;
            if (true) {//worker_id !== "0") {
                const now_index = working_index_dic[worker_id];
                if (CheckOrder(order_dic, worker_id, now_index, QueryString["product_name"])) {
                    next_location = GetNextLocation(order_dic, worker_id, now_index);
                    working_index_dic[worker_id] += 1;
                    logger.info(worker_id + " is scanning correctly");
                    console.log(worker_id + " is scanning correctly");
                }
                else {
                    try {
                        next_location = "Miss (" + order_dic[worker_id][now_index] + ")";
                        logger.info(worker_id + " is NOT scanning correctly");
                        console.log(worker_id + " is NOT scanning correctly");
                    }
                    catch (e) { }
                }
            }
        }*/

        // レスポンスの設定
        res.setHeader("Access-Control-Allow-Origin", "*");
        //res.setHeader("Access-Control-Allow-Origin", "http://150.82.177.133");
        //res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        //res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.write(next_location);
        res.end();
    })
    server.listen(80);
})();