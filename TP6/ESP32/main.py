from time import sleep
from boot import scroll_in_screen
import json

def connectBroker():
  global client_id, mqtt_server
  client = MQTTClient(client_id, mqtt_server)
  client.set_callback(sub_cb)
  client.connect()
  return client

def sub_cb(topic, msg):
  global oled, workerid, worker_sub
  
  oled.fill(0)
  oled.show()
  screen2 =[[0,30, msg]]
  scroll_in_screen(screen2)
  
  print((topic, msg))
  
  if topic == worker_sub:
    #msg del master ==> {destination = "", worker : "" }
    print('Work assigned')
    msgoled = b'Work assigned'
    oled.fill(0)
    oled.show()
    screen2 =[[0,30, msgoled]]
    scroll_in_screen(screen2)
    msgjson = json.loads(msg)
    freq = msgjson["freq"]
    iteration = msgjson["iteration"]
    workerid = msgjson["worker_id"]
    work_led(freq, iteration)
    request_worker()

try:
  client = connectBroker()
  
except OSError as e:
  restart_and_reconnect()

def restart_and_reconnect():
  msg = 'Failed to connect to MQTT broker. Reconnecting...'
  print( msg )
  oled.fill(0)
  oled.show()
  screen2 =[[0,30, msg]]
  scroll_in_screen(screen2)
  time.sleep(10)
  machine.reset()

def request_worker():
  try:
    #client.check_msg()
    #msg al master ==> {sensor_id : "", worker : "" }
    global oled, idesp32, workerid, master_pub
    esp32_id = str(idesp32)
    msg = b'{ "sensor_id": "%s", "worker": "%s" }' % (esp32_id, workerid)
    msgoled = b'Request worker to master'
    print(msgoled)
    oled.fill(0)
    oled.show()
    screen2 =[[0,30, msgoled]]
    scroll_in_screen(screen2)

    client.publish(master_pub, msg)
  except OSError as e:
    restart_and_reconnect()

def work_led(freq, iteration):
  print('freq '+ str(freq)+ ' ite '+ str(iteration))
  global oled, i2c_rst, idesp32, workerid, led
  i = 0
  msgoled = b'working'
  oled.fill(0)
  oled.show()
  screen2 =[[0,30, msgoled]]
  scroll_in_screen(screen2)
  while i <= int(iteration):
    led.value(1)
    print('led on ')
    sleep(float(freq))
    led.value(0)
    sleep(float(freq))
    print('led off')
    i = i + 1
    
##Subscriber


def subscribe_Worker():
  global idesp32, worker_sub, mqtt_server
  print('Worker topic: ' + 'upb/%s/response' % idesp32)
  worker_sub = b'upb/%s/response' % idesp32
  client.subscribe(worker_sub)
  print('Connected to %s MQTT Worker, subscribed to %s topic' % (mqtt_server, worker_sub))
  request_worker()
  return client


try:
  subscribe_Worker()
  
except OSError as e:
  restart_and_reconnect()

while True:
  try:
    client.check_msg()
    #print('client on '+clien)
  except OSError as e:
    restart_and_reconnect()