"""概要(Summary line)

3列のcsvファイルをもとに
バーコードの乱数を付与したcsvファイルを作成する

Example
-------
python main.py filename

"""

import sys

from locationpackage import *

if len(sys.argv) < 2:
    print("ファイルが指定されていません。")
    quit()

src_csv_file = sys.argv[1]
intermediate_csv = "pos.csv"
dst_xlsx_file = "pos.xlsx"

result = create_csv.give_barcode_value(src_csv_file, intermediate_csv)
if result:
    print("バーコードの付与に失敗しました。(" + str(result) + ")")
    quit()

result = create_xlsx.create_xlsx_file(intermediate_csv, dst_xlsx_file)
if result:
    print("エクセルファイルの作成に失敗しました。(" + str(result) + ")")