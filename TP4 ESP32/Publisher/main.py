from time import sleep
from boot import scroll_in_screen
def connect():
  global client_id, mqtt_server, topic_pub
  client = MQTTClient(client_id, mqtt_server)
  client.connect()
  print('Connected to %s MQTT broker, subscribed to %s topic' % (mqtt_server, topic_pub))
  return client

def restart_and_reconnect():
  print('Failed to connect to MQTT broker. Reconnecting...')
  time.sleep(10)
  machine.reset()

try:
  client = connect()
except OSError as e:
  restart_and_reconnect()

while True:
  try:
    client.check_msg()
    if (time.time() - last_message) > message_interval:
      msg = b'vini hola como estas hermano kek #%d' % counter
      global oled, i2c_rst
      oled.fill(0)
      oled.show()
      screen2 =[[0,30, msg]]
      scroll_in_screen(screen2)
      client.publish(topic_pub, msg)
      last_message = time.time()
      counter += 1
  except OSError as e:
    restart_and_reconnect()