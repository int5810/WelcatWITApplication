"""概要(Summary line)

計測者名リストファイルに計測者コードを付与したcsvファイルを作成する

Example
-------
python create_csv.py f:filename

"""

import os
import time

import numpy as np


def give_subject_code(srcfile="testdata.csv", dstfile="subjectlist.csv"):
    """概要(Summary line)

    csvファイルに計測者名に対応した従業員コード風のデータを付与する
    コードはとりあえず4桁の整数で

    Parameters
    ----------
    srcfile: str
        入力ファイル名
    dstfile: str
        出力csvファイル名

    Returns
    -------
    bool
        バーコードの付与の成功or失敗

    """
    
    # 乱数のシード設定
    np.random.seed(int(time.time()))
    # 拡張子ごとに処理
    if os.path.splitext(dstfile)[1] == ".txt":
        return __from_txt(srcfile, dstfile)
    if os.path.splitext(dstfile)[1] == ".csv":
        return __from_csv(srcfile, dstfile)

    return False


def __from_txt(srcfile, dstfile):
    """概要(Summary line)

    テキストファイルからファイルを生成する

    Parameters
    ----------
    srcfile: str
        入力テキストファイル名
    dstfile: str
        出力csvファイル名

    Returns
    -------
    bool
        ファイ作成の成功or失敗

    """

    subject_code_array = np.array([1234], dtype=np.uint64)
    try:
        with open(dstfile, "w") as fw:
            with open(srcfile, "r") as fr:
                line = fr.readline()
                is_first = True
                while line:
                    if is_first:
                        is_first = False
                    else:
                        line = "\n" + line
                    # カンマを足す
                    if line[-1] == "\n":
                        line = line[:-1] + ","
                    else:
                        line += ","
                    subject_code = 0
                    while subject_code == 0 or subject_code in subject_code_array:
                        subject_code = __get_subject_code()
                    fw.write(line + str(subject_code).zfill(4))
                    subject_code_array = np.append(subject_code_array, subject_code)
                    line = fr.readline()
                return True
    except:
        return False


def __from_csv(srcfile, dstfile):
    """概要(Summary line)

    csvファイルからファイルを生成する

    Parameters
    ----------
    srcfile: str
        入力csvファイル名
    dstfile: str
        出力csvファイル名

    Returns
    -------
    bool
        バーコードの付与の成功or失敗

    """

    names = []
    # 入力ファイルの読み込み
    with open(srcfile, "r") as fr:
        line = fr.readline()
        while line:
            line_split = line.split(",")
            if line_split[-1][-1] == "\n":
                line_split[-1] = line_split[-1][:-1]    # 改行コードを除去
            names.extend(line_split)
            line = fr.readline()
    names_num = len(names)
    # コードを生成
    code_array = np.empty(0, dtype=np.uint64)
    unique_array = np.unique(code_array)
    MAX_COUNT = 100
    count = 0
    while len(unique_array) != names_num:
        code_array = __get_subject_code(names_num)
        unique_array = np.unique(code_array)
        count += 1
        if count == MAX_COUNT:
            return False
    # csv形式で出力
    with open(dstfile, "w") as fw:
        is_first = True
        for name, code in zip(names, code_array):
            if is_first:
                is_first = False
                fw.write(name + "," + str(code).zfill(4))
            else:
                fw.write("\n" + name + "," + str(code).zfill(4))

    return True


def __get_subject_code(size=None):
    """概要(Summary line)

    従業員コードを生成する

    Parameters
    ----------
    size : int or None
        コード数

    Returns
    -------
    int or ndarray
        コード

    """

    if size is None:
        return np.random.randint(10000, dtype=np.uint64)
    return np.random.randint(10000, size=size, dtype=np.uint64)


# メイン文の実行
if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("ファイルが指定されていません。")
        quit()
    if not give_subject_code(sys.argv[1]):
        print("バーコードの付与に失敗しました。")
        quit()
