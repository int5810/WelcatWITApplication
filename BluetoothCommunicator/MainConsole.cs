using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Ports;
using System.Linq;
using System.Text;

namespace USBController
{
    class MainConsole
    {
        static StreamWriter sw = null;
        static string filename;
        static bool receive_type = false;//true:ファイル送信シーケンスのとき
        static bool half_flag = false;
        static System.Threading.Mutex mutex;
        static int stage;  //0、非オープン時　1、オープンかつファイル未作成　2、オープンかつファイル作成済

        static void Main()
        {
            string portName = "";   //事前チェック用
            SerialPort serialPort = new SerialPort();
            serialPort.DataReceived += new SerialDataReceivedEventHandler(DataReceived);
            serialPort.BaudRate = 115200;   //14400バイト/秒
            serialPort.Parity = Parity.None;
            serialPort.DataBits = 8;
            serialPort.Handshake = Handshake.RequestToSend;
            serialPort.StopBits = StopBits.One;
            serialPort.WriteTimeout = 10000;    //10秒
            serialPort.ReadTimeout = SerialPort.InfiniteTimeout;
            serialPort.DtrEnable = true;
            serialPort.RtsEnable = true;

            var check = new System.Text.RegularExpressions.Regex("(COM[1-9][0-9]?[0-9]?)");
            mutex = new System.Threading.Mutex();

            //メインループ
            stage = 0;
            char key;
            bool finishFlag = false;
            ShowMenu(serialPort);
            try
            {
                while (!finishFlag)
                {
                    key = Console.ReadKey(true).KeyChar;
                    switch (key)
                    {
                        case 'a':
                            {
                                try
                                {
                                    System.Diagnostics.Process.Start("control.exe", "bthprops.cpl");  //こっちから見てもらいたい
                                }
                                catch (Exception)
                                {
                                    string[] ports = SerialPort.GetPortNames();
                                    var nums = new List<int>();
                                    if (ports.Length != 0)
                                    {
                                        foreach (string port in ports)
                                            nums.Add(int.Parse(port.Substring(3, port.Length - 3)));
                                        nums.Sort();
                                        foreach (int num in nums)
                                            Console.Write("COM" + num + " ");
                                        Console.WriteLine();
                                    }
                                    else
                                        Console.WriteLine("有効なCOMポートがありません");
                                }
                            }
                            break;

                        //オープン
                        case 'o':
                            {
                                Console.Write("Open COM port :");
                                portName = Console.ReadLine();
                                if (!portName.StartsWith("COM"))
                                    portName = "COM" + portName;
                                if (!check.IsMatch(portName))
                                {
                                    Console.WriteLine("無効なCOMポートが入力されました。");
                                    break;
                                }
                                
                                serialPort.PortName = portName;
                                try
                                {
                                    serialPort.Open();
                                    Console.WriteLine("result : " + serialPort.IsOpen);
                                    if (serialPort.IsOpen)
                                        stage = 1;
                                }
                                catch (IOException) //通常失敗時、発信側につないだときとか
                                {
                                    Console.WriteLine("result : " + serialPort.IsOpen);
                                }
                                catch (UnauthorizedAccessException)
                                {
                                    Console.WriteLine("既に使用されているか、使用権限がありません。");
                                }
                                catch (Exception)
                                {
                                    Console.WriteLine("例外が発生しました。");
                                }
                            }
                            break;

                        case 't':
                            {
                                if (!serialPort.IsOpen)
                                {
                                    Console.WriteLine("オープンされていません。");
                                    break;
                                }
                                var now_date = DateTime.Now;
                                try
                                {
                                    serialPort.Write(now_date.Year + now_date.Month.ToString("D2") + now_date.Day.ToString("D2") +
                                    now_date.Hour.ToString("D2") + now_date.Minute.ToString("D2") + now_date.Second.ToString("D2"));
                                }
                                catch (TimeoutException)
                                {
                                    Console.WriteLine("タイムアウトしました。");
                                }
                            }
                            break;

                        case 's':
                            {
                                if (!serialPort.IsOpen)
                                {
                                    Console.WriteLine("オープンされていません。");
                                    break;
                                }
                                Console.WriteLine("(注)バイナリファイルは正常に転送できません。");
                                Console.WriteLine("送るファイルを指定してください\n1:'./subjectlist.csv' 2:'./productlist.csv' 0:その他");
                                key = Console.ReadKey(true).KeyChar;
                                receive_type = true;
                                switch (key)
                                {
                                    case '1':
                                        {
                                            SendFile("subjectlist.csv", serialPort);
                                        }
                                        break;

                                    case '2':
                                        {
                                            SendFile("productlist.csv", serialPort);
                                        }
                                        break;

                                    case '0':
                                        {
                                            //SendFile("subjectlist.csv", serialPort);//テスト中
                                        }
                                        break;

                                    default:
                                        {}
                                        break;
                                }
                            }
                            break;

                        //クローズのみ
                        case 'z':
                            {
                                serialPort.Close();
                                if (sw != null)
                                {
                                    sw.Close();
                                    sw = null;
                                }
                                stage = 0;
                                Console.WriteLine("Closed");
                            }
                            break;

                        //プログラムの終了
                        case 'q':
                            {
                                serialPort.Close();
                                finishFlag = true;
                            }
                            break;

                        default:
                            ShowMenu(serialPort);
                            break;
                    }
                }
            }
            catch (Exception){ }
            finally
            {
                if (sw != null)
                    sw.Close();
            }
        }

        static void ShowMenu(SerialPort serialPort)
        {
            Console.WriteLine(
                "\n---Operation--------------------------------------" +
                "\n a: Check Available COM" +
                "\n o: Open Port" +
                "\n t: Adjust Time" +
                "\n s: Send File to WIT-220" + 
                "\n c: Close Port" +
                "\n q: Finish" +
                "\n---Parameter--------------------------------------" +
                "\n COM Port     : " + serialPort.PortName +
                "\n IsOpen : " + serialPort.IsOpen);
#if DEBUG
            Console.WriteLine(" stage : " + stage);
            Console.WriteLine("");
            try
            {
                Console.WriteLine(" DsrHolding : " + serialPort.DsrHolding);
            }
            catch(Exception)
            {
                Console.WriteLine(" DsrHolding : Unknown");
            }
            try
            {
                Console.WriteLine(" BreakState : " + serialPort.BreakState);
            }
            catch (Exception)
            {
                Console.WriteLine(" BreakState : Unknown");
            }
            try
            {
                Console.WriteLine(" CDHolding : " + serialPort.CDHolding);
            }
            catch (Exception)
            {
                Console.WriteLine(" CDHolding : Unknown");
            }
            try
            {
                Console.WriteLine(" CtsHolding : " + serialPort.CtsHolding);
            }
            catch (Exception)
            {
                Console.WriteLine(" CtsHolding : Unknown");
            }
            try
            {
                Console.WriteLine(" DtrEnable : " + serialPort.DtrEnable);
            }
            catch (Exception)
            {
                Console.WriteLine(" DtrEnable : Unknown");
            }
            try
            {
                Console.WriteLine(" RtsEnable : " + serialPort.RtsEnable);
            }
            catch (Exception)
            {
                Console.WriteLine(" RtsEnable : Unknown");
            }
#endif
            Console.WriteLine("\n--------------------------------------------------");
        }

        static void SendFile(string filepath, SerialPort sp)
        {
            string filename = Path.GetFileName(filepath);
            try
            {
                sp.Write(filename.Length.ToString("D3"));
            }
            catch
            {
                Console.WriteLine("タイムアウトしました。");
                return;
            }
            byte[] filename_bytes = Encoding.BigEndianUnicode.GetBytes(filename);
            string send_filename = "";
            foreach (byte buf in filename_bytes)
            {
                send_filename += buf.ToString("X2");
                Console.Write(buf.ToString("X2") + " ");
            }
            sp.Write(send_filename);

            long filesize = new FileInfo(filepath).Length;
            int buffer_maxsize = 1024;//4096;   //一度に送る文字数、限界については要調査
            string size_str = buffer_maxsize.ToString("D8");
            int buffer_count = 0;//送信済のバイト数
            char[] buffer_char = null;
            using (StreamReader sr = new StreamReader(filepath, Encoding.GetEncoding("shift_jis")))
            {
                while (buffer_count < filesize)
                {
                    mutex.WaitOne();
                    try
                    {
                        //送信サイズの決定
                        int send_charsize;
                        if (filesize - buffer_count >= buffer_maxsize)
                            send_charsize = buffer_maxsize;
                        else
                            send_charsize = (int)filesize - buffer_count;//はみ出すこともあるが問題ない
                        buffer_char = new char[send_charsize];
                        sr.Read(buffer_char, 0, send_charsize);//文字数はsend_sizeだが、バイト数はそれよりも大きくなる
                        string buffer_test = new string(buffer_char);
                        Console.WriteLine("buffer_test:" + buffer_test);
                        int send_bytesize = Encoding.GetEncoding("shift_jis").GetByteCount(buffer_test);
                        Console.WriteLine("send_bytesize:" + send_bytesize);
                        Console.WriteLine("send_charsize:" + send_charsize);
                        sp.Write(send_charsize.ToString("D8"));//送信する文字数を伝達
                        buffer_count += send_bytesize;
                        //ファイル内容を送信
                        byte[] buffer_bytes = Encoding.BigEndianUnicode.GetBytes(buffer_char);
                        string buffer = "";
                        foreach (byte test in buffer_bytes)
                        {
                            buffer += test.ToString("X2");
                            Console.Write(test.ToString("X2") + " ");
                        }
                        sp.Write(buffer);

                        Console.WriteLine("");
                        Console.WriteLine("------------------");
                        string str_utf16 = "飯村晃平iimrkuhi";//1文字に4バイト使ってそうだけどしょうがなし
                        byte[] bytes_uni = Encoding.BigEndianUnicode.GetBytes(str_utf16);
                        string buffer0 = "";
                        foreach (byte buf in bytes_uni)
                        {
                            buffer0 += buf.ToString("X2");
                            Console.Write(buf.ToString("X2") + " ");
                        }
                        Console.WriteLine();
                        Console.WriteLine(buffer);
                    }
                    catch (Exception)
                    {
                        Console.WriteLine("エラーをキャッチしました。");
                    }
                    finally
                    {
                        //mutex.ReleaseMutex();
                    }
                }
            }
            sp.Write("00000001");
            sp.WriteLine("001A");
            Console.WriteLine("ファイルの送信が完了しました。");
        }

        static void DataReceived(object sender, SerialDataReceivedEventArgs e)
        {
            SerialPort sp = (SerialPort)sender;

            int rbyte = sp.BytesToRead;
            Console.WriteLine("DataReceived\nbuffer.Length = " + rbyte);
            if (rbyte != 0)
            {
                if (receive_type)
                {
                    if (half_flag || rbyte == 2)//OKが来たとき
                    {
                        mutex.ReleaseMutex();
                        receive_type = false;
                        half_flag = false;
                    }
                    else
                    {
                        half_flag = true;
                    }
                }
                else
                {
                    byte[] buffer = new byte[rbyte];
                    sp.Read(buffer, 0, rbyte);
                    foreach (byte buf in buffer)
                    {
                        Console.Write(buf.ToString("X2") + " ");
                    }
                    Console.WriteLine();
                    switch (stage)
                    {
                        case 1:
                            {
                                string buffer_str = System.Text.Encoding.ASCII.GetString(buffer);
                                filename += buffer_str;
                                if (filename.EndsWith(".csv"))
                                {
                                    int count = 0;
                                    //先に出力先確保
                                    while (true)
                                    {
                                        string file_name = filename.Substring(0, filename.Length - 4);
                                        string file_ext = ".csv";
                                        if (count != 0)
                                            file_name += "(" + count + ")";
                                        if (File.Exists(file_name + file_ext))
                                        {
                                            count++;
                                        }
                                        else
                                        {
                                            sw = new StreamWriter(file_name + file_ext, false, System.Text.Encoding.GetEncoding("shift_jis"));
                                            Console.WriteLine(file_name + file_ext + " Created");
                                            break;
                                        }
                                    }
                                    sp.Write("OK");
                                    stage = 2;
                                    filename = "";
                                }
                            }
                            break;

                        case 2:
                            {
                                if (buffer.Contains(Convert.ToByte('\x1A')))
                                {
                                    string utf8_str = System.Text.Encoding.UTF8.GetString(buffer.Take(buffer.Length - 1).ToArray());
                                    byte[] utf8_bytes = System.Text.Encoding.Default.GetBytes(utf8_str);
                                    string buffer_str = System.Text.Encoding.GetEncoding("shift_jis").GetString(utf8_bytes);
                                    sw.Write(buffer_str);
                                    sw.Close();
                                    sw = null;
                                    stage = 1;
                                    sp.Write("OK");
                                }
                                else
                                {
                                    string utf8_str = System.Text.Encoding.UTF8.GetString(buffer);
                                    byte[] utf8_bytes = System.Text.Encoding.Default.GetBytes(utf8_str);
                                    string buffer_str = System.Text.Encoding.GetEncoding("shift_jis").GetString(utf8_bytes);
                                    sw.Write(buffer_str);
                                }
                            }
                            break;

                        default:
                            Console.WriteLine("想定外の処理が行われました。");
                            break;
                    }
                }
            }
        }
    }
}