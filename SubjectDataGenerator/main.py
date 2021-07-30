"""概要(Summary line)

3列のcsvファイルをもとに
バーコードの乱数を付与したcsvファイルを作成する

Example
-------
python main.py srcfile

"""

import sys

from subjectpackage import *

if len(sys.argv) < 2:
    print("ファイルが指定されていません。")
    quit()

srcfile = sys.argv[1]
intermediate_csv = "subjectlist.csv"
dst_xlsx_file = "subject.xlsx"

if not create_csv.give_subject_code(srcfile, intermediate_csv):
    print("従業員コードの付与に失敗しました。")
    quit()

if not create_xlsx.create_xlsx_file(intermediate_csv, dst_xlsx_file):
    print("エクセルファイルの作成に失敗しました。")
