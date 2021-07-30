"""概要(Summary line)

3列のcsvファイルをもとに
バーコードの乱数を付与したcsvファイルを作成する

Example
-------
python create_csv.py f:filename

"""

import sys
import time

import numpy as np


def give_barcode_value(filename="testdata.csv", dstfile="out.csv"):
    """概要(Summary line)

    csvファイルにバーコードの乱数を付与する

    Parameters
    ----------
    filename: str
        対象のcsvファイル名

    Returns
    -------
    bool
        バーコードの付与の成功or失敗

    """

    np.random.seed(int(time.time()))
    # ファイルの読み込み
    try:
        csv_data = np.loadtxt(filename, dtype=np.float64, delimiter=",")
    except:
        return False
    if csv_data.shape[1] != 3:
        return False    # x,y,zの構成でなければダメ
    # 行数の取得
    len_data = len(csv_data)
    # バーコードデータの作成
    barcode_values = np.empty(0, dtype=np.uint64)
    while len(barcode_values) < len_data:
        # とりあえず16進数で10桁
        add_barcode_values = np.random.randint(0xffffffffff+1, size=len_data-len(barcode_values), dtype=np.uint64)
        barcode_values = np.append(barcode_values, add_barcode_values)
        barcode_values = np.unique(barcode_values)
        barcode_values = barcode_values[np.random.choice(len(barcode_values), size=len(barcode_values), replace=False)]
    try:
        with open(dstfile, "w") as fw:
            i = 1
            for csv_row, barcode_value in zip(csv_data, barcode_values):
                fw.write("{},{},{},{}".format(csv_row[0], csv_row[1], csv_row[2], hex(barcode_value)[2:]))
                if i != len_data:
                    fw.write("\n")
                i += 1
    except:
        return False

    return True

# メイン文の実行
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("ファイルが指定されていません。")
        quit()
    if not give_barcode_value(sys.argv[1]):
        print("バーコードの付与に失敗しました。")
        quit()
