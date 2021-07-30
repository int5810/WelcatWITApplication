import paho.mqtt.client as mqtt


def on_connect(client, userdata, flags, respons_code):
    topic = 'evt/barcode/#'
    print('watch %s' % topic)
    client.subscribe(topic)


def on_message(client, userdata, msg):
    print(' ' + msg.topic + ' ' + str(msg.payload))


def main():
    host = "test.mosquitto.org"
    port = 1883
    print("press <Ctrl+C> to quit.")
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(host, port, keepalive=60)
    client.loop_forever()


# メイン文の実行
if __name__ == "__main__":
    main()
