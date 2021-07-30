//デコードモード
var _DCM_SINGLE = 0;
var _DCM_MULTI  = 1;

//バーコード種別
var _BCT_JAN13      = 1 <<  0;
var _BCT_JAN8       = 1 <<  1;
var _BCT_UPCE       = 1 <<  2;
var _BCT_NW7        = 1 <<  3;
var _BCT_CODE39     = 1 <<  4;
var _BCT_CODE93     = 1 <<  5;
var _BCT_CODE128    = 1 <<  6;
var _BCT_INT25      = 1 <<  7;
var _BCT_IND25      = 1 <<  8;
var _BCT_DATABAR    = 1 <<  9;
var _BCT_QR         = 1 <<  11;
var _BCT_PDF417     = 1 <<  12;
var _BCT_DMATRIX    = 1 <<  13;
var _BCT_COMPOSITE  = 1 <<  16;
var _BCT_COOP       = 1 <<  17;

var _BCT_JANS       = _BCT_JAN13     | _BCT_JAN8   | _BCT_UPCE;

var _BCT_MULTI      = _BCT_JAN13     | _BCT_JAN8      | _BCT_UPCE   | 
                      _BCT_NW7       | _BCT_CODE39    | _BCT_CODE93 | 
                      _BCT_CODE128   | _BCT_INT25     | _BCT_IND25  | 
                      _BCT_DATABAR   | _BCT_QR        | _BCT_PDF417 | 
                      _BCT_DMATRIX   | _BCT_COMPOSITE | _BCT_COOP;

//バーコード種別に対するオプション
var _BOPT_ONLY       = 1 << 0;
var _BOPT_IGNORE     = 1 << 1;
var _BOPT_IDENT      = 1 << 2;
var _BOPT_NOCHKDGT   = 1 << 3;
var _BOPT_NOSUPRESS  = 1 << 4;
var _BOPT_NOCHECK    = _BOPT_NOCHKDGT | _BOPT_NOSUPRESS;
var _BOPT_ADDSTART   = 1 << 5;
var _BOPT_ONLYGS1128 = 1 << 9;
var _BOPT_ADDON      = 1 << 11;
var _BOPT_ADDONONLY  = 1 << 12;
var _BOPT_MPDF       = 1 << 14;
var _BOPT_STANDARD   = 1 << 18;
var _BOPT_HEX        = 1 << 19;
var _BOPT_COLUMN     = 1 << 23;
var _BOPT_DATABAREXP = 1 << 25;
var _BOPT_MQR        = 1 << 26;
var _BOPT_INVERT     = 1 << 27;
var _BOPT_INVONLY    = 1 << 28;
var _BOPT_UANZERODEL = 1 << 29;

//スキャナ
var _BCRCMD_POWEROFF  = 11;
var _BCRCMD_POWERON   = 12;
var _BCRCMD_DECODEOFF = 13;
var _BCRCMD_DECODEON  = 14;
var _BCRCMD_AIMINGON  = 15;
var _BCRCMD_AIMINGOFF = 16;

//センサトリガ
var _SNS_TRG_TAP      = 0;
var _SNS_TRG_STOP     = 1;
var _SNS_TRG_PROX     = 2;
var _SNS_TRG_DIRECT   = 3;

//ソフトウェアキーボード
var _SOFTKBD_OPT_CHAR_ALL            = 0x0000;
var _SOFTKBD_OPT_CHAR_DIGIT          = 0x0001;
var _SOFTKBD_OPT_CHAR_PERIOD         = 0x0002;
var _SOFTKBD_OPT_CHAR_ALPHABET       = 0x0004;
var _SOFTKBD_OPT_CHAR_SYMBOL         = 0x0008;
var _SOFTKBD_OPT_CHAR_SPACE          = 0x0010;
var _SOFTKBD_OPT_CHAR_HALFKANA       = 0x2000;
var _SOFTKBD_OPT_CHAR_HALFKANASPACE  = 0x4000;
var _SOFTKBD_OPT_CHAR_HALFKANASYMBOL = 0x8000;
var _SOFTKBD_OPT_PASSWORD            = 0x10000;

//メッセージボックス
var _MSGBOX_BTN_OKONLY        = 0x00;
var _MSGBOX_BTN_OKCANCEL      = 0x01;
var _MSGBOX_BTN_YESNO         = 0x02;
var _MSGBOX_BTN_YESNOJP       = 0x03;
var _MSGBOX_BTN_RETRYCANCEL   = 0x04;
var _MSGBOX_BTN_RETRYCANCELJP = 0x05;
var _MSGBOX_RTN_BUTTON1       = 0;
var _MSGBOX_RTN_BUTTON2       = 1;
var _MSGBOX_RTN_CANCEL        = -1;

//インジケータ
var _INDID_STOP    = -1;
var _INDID_CANCEL1 = 0;
var _INDID_CANCEL2 = 1;
var _INDID_CANCEL3 = 2;
var _INDID_ENTER1  = 3;
var _INDID_ENTER2  = 4;
var _INDID_ENTER3  = 5;
var _INDID_CLICK1  = 6;
var _INDID_CLICK2  = 7;
var _INDID_CLICK3  = 8;
var _INDID_NOTICE1 = 9;
var _INDID_NOTICE2 = 10;
var _INDID_NOTICE3 = 11;
var _INDID_ERROR1  = 12;
var _INDID_ERROR2  = 13;
var _INDID_ERROR3  = 14;
var _INDID_USR1    = 15;
var _INDID_USR2    = 16;
var _INDID_USR3    = 17;

//ISO/IEC 15693 パラメータ
var _RFID_CFG_TIMESLOTS  = 0;
var _RFID_CFG_AFI        = 1;
var _RFID_CFG_MODULATION = 2;
var _RFID_CFG_BLOCKSIZE  = 3;

//ISO/IEC 15693 エラー
var _RFID_OPENERR             =   -1;
var _RFID_CLOSEERR            =   -2;
var _RFID_PARAMETERERR        =   -3;
var _RFID_NOTAGERR            =  -17;
var _RFID_COLLISION           =  -18;
var _RFID_TAGINFIELD          =  -19;
var _RFID_INTERNALERR         = -255;
var _RFID_TAGRES_CMDERR       = -257;
var _RFID_TAGRES_PARAMETERERR = -258;
var _RFID_TAGRES_READERR      = -259;
var _RFID_TAGRES_WRITEERR     = -260;
var _RFID_TAGRES_LOCKERR      = -261;
var _RFID_TAGRES_OTHERERR     = -511;

//NFC 種類
var _NFC_DETECT_TYP_A = 1;
var _NFC_DETECT_TYP_B = 2;
var _NFC_DETECT_TYP_F = 4;

//NFC エラー
var _NFC_OPENERR             =   -1;
var _NFC_CLOSEERR            =   -2;
var _NFC_PARAMETERERR        =   -3;
var _NFC_NOTAGERR            =  -17;
var _NFC_COLLISION           =  -18;
var _NFC_TAGINFIELD          =  -19;
var _NFC_INTERNALERR         = -255;
var _NFC_TAGRES_CMDERR       = -257;
var _NFC_TAGRES_PARAMETERERR = -258;
var _NFC_TAGRES_READERR      = -259;
var _NFC_TAGRES_WRITEERR     = -260;
var _NFC_TAGRES_LOCKERR      = -261;
var _NFC_TAGRES_OTHERERR     = -511;

//クエリ文字列の取得
var QueryString = (function () {
    var query, queryItems, queryItem,
        i, length, key, value, params = {};
 
    query = window.location.search;
    query = query.substr(1, query.length);
 
    queryItems = query.split('&');
 
    for (i = 0, length = queryItems.length; i < length; i++) {
        queryItem = (queryItems[i]).split('=');
 
        key = queryItem[0];
        value = queryItem[1];
 
        params[key] = value;
    }
 
    return params;
})();
