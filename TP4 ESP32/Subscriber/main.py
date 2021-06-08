from time import sleep
from boot import scroll_in_screen

def sub_cb(topic, msg):
  global oled, i2c_rst, led
  led.value(1)
  oled.fill(0)
  oled.show()
  screen2 =[[0,30, msg]]
  scroll_in_screen(screen2)
  sleep(0.5)
  led.value(0)
 #oled.text(msg, 0, 30)
  #oled.show()
  print((topic, msg))
  if topic == b'upb/ds/class':
    print('ESP received message')

def connect_and_subscribe():
  global client_id, mqtt_server, topic_sub
  client = MQTTClient(client_id, mqtt_server)
  client.set_callback(sub_cb)
  client.connect()
  client.subscribe(topic_sub)
  print('Connected to %s MQTT broker, subscribed to %s topic' % (mqtt_server, topic_sub))
  return client

def restart_and_reconnect():
  print('Failed to connect to MQTT broker. Reconnecting...')
  time.sleep(10)
  machine.reset()

try:
  client = connect_and_subscribe()
except OSError as e:
  restart_and_reconnect()

while True:
  try:
    client.check_msg()
    if (time.time() - last_message) > message_interval:
      msg = b'Hello #%d' % counter
      client.publish(topic_pub, msg)
      last_message = time.time()
      counter += 1
  except OSError as e:
    restart_and_reconnect()