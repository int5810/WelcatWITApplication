/** @description ワーカーIDとWMSで前もって定義された棚の順番リストの紐づけ辞書を作成する
 * @param {string} file_path 読込対象ファイルパス
 * @returns {object}
 */
async function CreateOrderDictionary(file_path) {
    const fs = require("fs");
    const readline = require("readline");
    const order_dic = {};

    //csvファイル読み込み
    if (!fs.existsSync(file_path))
        return order_dic;
    const stream = fs.createReadStream(file_path);
    const lines = readline.createInterface({
        input: stream
    });

    //ループ処理
    let elements;
    for await (const line of lines) {
        elements = line.split(":");
        if (elements.length !== 2)
            break;
        order_dic[elements[0]] = elements[1].split(",");
    };
    return order_dic;
}

/** @description 次の作業場所の文字列を取得する
 * @param {string} order_dic キーがワーカーID、値が作業順に並んだ棚リスト
 * @param {string} worker_id ワーカーID
 * @param {string} index 現在の作業位置
 * @returns {string}
 */
function GetFirstLocation(order_dic, worker_id) {
    let first_location = "";
    if (worker_id in order_dic)
        first_location = order_dic[worker_id][0];
    return first_location;
}

/** @description ワーカーが作業順として正しい棚をスキャンしたかチェックする
 * @param {string} order_dic キーがワーカーID、値が作業順に並んだ棚リスト
 * @param {string} worker_id ワーカーID
 * @param {string} index 現在の作業位置
 * @returns {boolean}
 */
function CheckOrder(order_dic, worker_id, index, scan_name) {
    return worker_id in order_dic &&
        index < order_dic[worker_id].length &&
        scan_name == order_dic[worker_id][index];
}

/** @description 次の作業場所の文字列を取得する
 * @param {string} order_dic キーがワーカーID、値が作業順に並んだ棚リスト
 * @param {string} worker_id ワーカーID
 * @param {string} index 現在の作業位置
 * @returns {string}
 */
function GetNextLocation(order_dic, worker_id, index) {
    let next_location = "Unknwon";
    if (worker_id in order_dic && index < order_dic[worker_id].length)
        next_location = order_dic[worker_id][index + 1];
    return next_location;
}

exports.CreateOrderDictionary = CreateOrderDictionary;
exports.GetFirstLocation = GetFirstLocation;
exports.CheckOrder = CheckOrder;
exports.GetNextLocation = GetNextLocation;