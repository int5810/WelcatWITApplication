/** @description �o�[�R�[�h�f�[�^�ƈʒu�̕R�Â��������쐬����
 * @param {any} file_path �Ǎ��Ώۃt�@�C���p�X
 * @returns {object}
 */
async function CreateBarcodeDictionary(file_path) {
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
    let label = "undefined";
    for await (const line of lines) {
        elements = line.split(",");
        if (elements.length < 4)
            break;
        else if (elements.length === 5)
            label = elements[4];
        dic[elements[3]] = [parseFloat(elements[0]), parseFloat(elements[1]), parseFloat(elements[2]), label];
        dic[label] = [parseFloat(elements[0]), parseFloat(elements[1]), parseFloat(elements[2]), label];//tnps�̓���
    };
    return dic;
}

exports.CreateBarcodeDictionary = CreateBarcodeDictionary;