# WIT Projects
�쐬���F2021/06/07

�쐬�ҁF�ё�

�쐬�E���s���FVS2017�A.Net 4.6.1�APython 3.8.6(64bit)�ANode.js v12.18.3�AWindowns10 Enterprise

## �T�v
�{�\�����[�V�����́AWelcat�А���WIT-220-NR��ΏۂƂ����A�o�[�R�[�h�X�L�����̃��M���O�p�v���O�����ł��B

�{�\�����[�V�����ɂ́A7�̃v���W�F�N�g������܂��B

* WelcatWITApplication
* BluetoothCommunicator(�C��)
* RelayServer(�C��)
* SubjectDataGenerator(�C��)
* LoctionDataGenerator(�C��)
* MqttSubscriber(�C��)
* SmartphoneSimulator(�C��)

### WelcatWITApplication
(�֘A����FHTML�Ajavascript)

WIT-220-NR�̓����A�v���P�[�V�����ł���uWBR001.OUT�v�œ��삳����HTML�t�@�C���Q�ł��B

�u���E�U�x�[�X�Ńo�[�R�[�h���[�_�[�Ƃ��Ă̋@�\��񋟂��܂��B

MQTT�p�̃T�[�o�[�A�h���X���A�ύX�̉\���̂���e��ݒ��utilities.js�̏㕔�ɂ���܂��B

### BluetoothCommunicator
(�֘A����FC#)

�uWelcatWITApplication�v�g�p���ɁABluetooth�ʐM�ɂăt�@�C���̑���M�⎞���������s���܂��B

Welcat�Ђ̃\�t�g�E�F�A�uBlueManager�v�A�uBluePorter2�v������ꍇ�͕s�v�ł��B

### RelayServer
(�֘A����FNode.js)

�X�L���������f�[�^��MQTT�ʐM��A����̒[���փo�C�i���ʐM���s�����߂�HTTP�T�[�o�[���N�����܂��B

MQTT�ʐM���s��Ȃ��ꍇ�͕s�v�ł��B

�g�p���C�u����
* fs : ISC���C�Z���X
* http : Proprietary
* log4js : Apache-2.0���C�Z���X
* mqtt : MIT���C�Z���X
* net : MIT���C�Z���X
* readline : BSD���C�Z���X

### SubjectDataGenerator
(�֘A����FPython)

�v���҂��J�n���Ɏ�����ID�̂悤�ȃR�[�h��ǂݍ��ނ��߂̃p�X���[�h�𐶐����܂��B

�o�[�R�[�h�̕\���ɂ�Code39�p�̃t�H���g���C���X�g�[������K�v������܂��B

�g�p���C�u����
* numpy : BSD���C�Z���X
* openpyxl : MIT���C�Z���X

### LocationDataGenerator
(�֘A����FPython)

���i�R�[�h�ƍ��W��A�g�������o�[�R�[�h�\�𐶐����܂��B

�o�[�R�[�h�̕\���ɂ�Code39�p�̃t�H���g���C���X�g�[������K�v������܂��B

�g�p���C�u����
* numpy : BSD���C�Z���X
* openpyxl : MIT���C�Z���X

### MqttSubscriber
(�֘A����FPython)

MQTT��publish�������e���m�F���邽�߂̃v���O�����ł��B

�g�p���C�u����
* paho-mqtt : Eclipse Public License v1.0 / Eclipse Distribution License v1.0

### SmartphoneSimulator
(�֘A����FPython)

�����IP(�X�}�z��z��)�փo�C�i���f�[�^�𑗐M����@�\���g�p�����ꍇ�ɁA

���̑��M����V�~�����[�g���邽�߂̃v���O�����ł��B