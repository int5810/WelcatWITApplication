# WIT Projects
作成日：2021/06/07

作成者：飯村

作成・実行環境：VS2017、.Net 4.6.1、Python 3.8.6(64bit)、Node.js v12.18.3、Windowns10 Enterprise

## 概要
本ソリューションは、Welcat社製もWIT-220-NRを対象とした、バーコードスキャンのロギング用プログラムです。

本ソリューションには、7つのプロジェクトがあります。

* WelcatWITApplication
* BluetoothCommunicator(任意)
* RelayServer(任意)
* SubjectDataGenerator(任意)
* LoctionDataGenerator(任意)
* MqttSubscriber(任意)
* SmartphoneSimulator(任意)

### WelcatWITApplication
(関連言語：HTML、javascript)

WIT-220-NRの内部アプリケーションである「WBR001.OUT」で動作させるHTMLファイル群です。

ブラウザベースでバーコードリーダーとしての機能を提供します。

MQTT用のサーバーアドレス等、変更の可能性のある各種設定はutilities.jsの上部にあります。

### BluetoothCommunicator
(関連言語：C#)

「WelcatWITApplication」使用中に、Bluetooth通信にてファイルの送受信や時刻同期を行います。

Welcat社のソフトウェア「BlueManager」、「BluePorter2」がある場合は不要です。

### RelayServer
(関連言語：Node.js)

スキャンしたデータをMQTT通信や、特定の端末へバイナリ通信を行うためのHTTPサーバーを起動します。

MQTT通信を行わない場合は不要です。

使用ライブラリ
* fs : ISCライセンス
* http : Proprietary
* log4js : Apache-2.0ライセンス
* mqtt : MITライセンス
* net : MITライセンス
* readline : BSDライセンス

### SubjectDataGenerator
(関連言語：Python)

計測者が開始時に自分のIDのようなコードを読み込むためのパスワードを生成します。

バーコードの表示にはCode39用のフォントをインストールする必要があります。

使用ライブラリ
* numpy : BSDライセンス
* openpyxl : MITライセンス

### LocationDataGenerator
(関連言語：Python)

商品コードと座標を連携させたバーコード表を生成します。

バーコードの表示にはCode39用のフォントをインストールする必要があります。

使用ライブラリ
* numpy : BSDライセンス
* openpyxl : MITライセンス

### MqttSubscriber
(関連言語：Python)

MQTTでpublishした内容を確認するためのプログラムです。

使用ライブラリ
* paho-mqtt : Eclipse Public License v1.0 / Eclipse Distribution License v1.0

### SmartphoneSimulator
(関連言語：Python)

特定のIP(スマホを想定)へバイナリデータを送信する機能を使用した場合に、

その送信先をシミュレートするためのプログラムです。