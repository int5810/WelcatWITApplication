/** @description ���[�J�[ID��WMS�őO�����Ē�`���ꂽ�I�̏��ԃ��X�g�̕R�Â��������쐬����
 * @param {string} file_path �Ǎ��Ώۃt�@�C���p�X
 * @returns {object}
 */
async function CreateOrderDictionary(file_path) {
    const fs = require("fs");
    const readline = require("readline");
    const order_dic = {};

    //csv�t�@�C���ǂݍ���
    if (!fs.existsSync(file_path))
        return order_dic;
    const stream = fs.createReadStream(file_path);
    const lines = readline.createInterface({
        input: stream
    });

    //���[�v����
    let elements;
    for await (const line of lines) {
        elements = line.split(":");
        if (elements.length !== 2)
            break;
        order_dic[elements[0]] = elements[1].split(",");
    };
    return order_dic;
}

/** @description ���̍�Əꏊ�̕�������擾����
 * @param {string} order_dic �L�[�����[�J�[ID�A�l����Ə��ɕ��񂾒I���X�g
 * @param {string} worker_id ���[�J�[ID
 * @param {string} index ���݂̍�ƈʒu
 * @returns {string}
 */
function GetFirstLocation(order_dic, worker_id) {
    let first_location = "";
    if (worker_id in order_dic)
        first_location = order_dic[worker_id][0];
    return first_location;
}

/** @description ���[�J�[����Ə��Ƃ��Đ������I���X�L�����������`�F�b�N����
 * @param {string} order_dic �L�[�����[�J�[ID�A�l����Ə��ɕ��񂾒I���X�g
 * @param {string} worker_id ���[�J�[ID
 * @param {string} index ���݂̍�ƈʒu
 * @returns {boolean}
 */
function CheckOrder(order_dic, worker_id, index, scan_name) {
    return worker_id in order_dic &&
        index < order_dic[worker_id].length &&
        scan_name == order_dic[worker_id][index];
}

/** @description ���̍�Əꏊ�̕�������擾����
 * @param {string} order_dic �L�[�����[�J�[ID�A�l����Ə��ɕ��񂾒I���X�g
 * @param {string} worker_id ���[�J�[ID
 * @param {string} index ���݂̍�ƈʒu
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