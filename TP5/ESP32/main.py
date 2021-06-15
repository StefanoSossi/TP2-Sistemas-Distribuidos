from time import sleep
from boot import scroll_in_screen
import json


##Publisher

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
    client.check_msg()
    #msg al master ==> {sensor_id : "", worker : "" }
    global oled, idesp32, workerid
    msg = b'{ sensor_id : %s, worker : %s }' % (idesp32, workerid)
    msgoled = b'Request worker to master'
    print(msgoled)
    oled.fill(0)
    oled.show()
    screen2 =[[0,30, msgoled]]
    scroll_in_screen(screen2)

    client.publish(master_pub, msg)
  except OSError as e:
    restart_and_reconnect()

def request_work():
  try:
    #client.check_msg()
    #msg al worker ==> {sensor_id : "" }
    global oled, i2c_rst, idesp32, workerid
    msg = b'{ sensor_id : %d}' % idesp32
    msgoled = b'Request work to worker'
    oled.fill(0)
    oled.show()
    screen2 =[[0,30, msgoled]]
    scroll_in_screen(screen2)
    client.publish(worker_pub, msg)
  except OSError as e:
    restart_and_reconnect()

def work_led(freq, iteration):
  global oled, i2c_rst, idesp32, workerid, led
  i = 0
  msgoled = b'working'
  oled.fill(0)
  oled.show()
  screen2 =[[0,30, msgoled]]
  scroll_in_screen(screen2)
  while i <= iteration:
    led.value(1)
    sleep(freq)
    led.value(0)
    
##Subscriber

def connect():
  global client_id, mqtt_server
  client = MQTTClient(client_id, mqtt_server)
  client.set_callback(sub_cb)
  client.connect()
  return client

def subscribe_master():
  client = connect()
  client.subscribe(master_sub)
  print('Connected to %s MQTT Master, subscribed to %s topic' % (mqtt_server, master_sub))
  request_worker()
  return client

def subscribe_Worker():
  client = connect()
  client.subscribe(worker_sub)
  print('Connected to %s MQTT Worker, subscribed to %s topic' % (mqtt_server, worker_sub))
  request_work()
  return client

def sub_cb(topic, msg):
  global oled, i2c_rst, led, idesp32, workerid, master_sub, worker_pub, worker_sub
  
  oled.fill(0)
  oled.show()
  screen2 =[[0,30, msg]]
  scroll_in_screen(screen2)
  
  print((topic, msg))
  if topic == master_sub:
    #msg del master ==> {destination = "", worker : "" }
    print(msg)
    oled.fill(0)
    oled.show()
    screen2 =[[0,30, msg]]
    scroll_in_screen(screen2)
    msgjson = json.loads(msg)
    if msgjson["destination"] == idesp32:
      print('Worker assigned')
      msgoled = b'Worker assigned'
      oled.fill(0)
      oled.show()
      screen2 =[[0,30, msgoled]]
      scroll_in_screen(screen2)
      workerid = msgjson["worker"]
      worker_sub = b'upb/%d/response' % workerid
      worker_pub = b'upb/%d/request' % workerid
      try:
        client = subscribe_Worker()
      except OSError as e:
        restart_and_reconnect()
      
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
    work_led()
    try:
      client = subscribe_master()
    except OSError as e:
      restart_and_reconnect()



try:
  client = subscribe_master()
except OSError as e:
  restart_and_reconnect()

while True:
  try:
    client.check_msg()
  except OSError as e:
    restart_and_reconnect()