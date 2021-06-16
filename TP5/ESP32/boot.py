import time
import ntptime
from umqttsimple import MQTTClient
import ubinascii
import machine
import micropython
import network
import esp
import utime
from machine import Pin, I2C
import ssd1306
from time import sleep
esp.osdebug(None)
import gc
gc.collect()

oled_width = 128
oled_height = 64
i2c_rst = Pin(16, Pin.OUT)
# Initialize the OLED display
i2c_rst.value(0)
time.sleep_ms(5)
i2c_rst.value(1)

i2c_scl = Pin(15, Pin.OUT, Pin.PULL_UP)
i2c_sda = Pin(4, Pin.OUT, Pin.PULL_UP)

i2c = I2C(scl=i2c_scl, sda=i2c_sda)
# Create the display object
oled = ssd1306.SSD1306_I2C(oled_width, oled_height, i2c)

led = Pin(25, Pin.OUT)


ssid = 'VALENZUELA WIFI'
password = 'Dermovate98$'
mqtt_server = 'research.upb.edu'
#EXAMPLE IP ADDRESS
#mqtt_server = '192.168.1.144'
client_id = ubinascii.hexlify(machine.unique_id())
master_sub = b'upb/master/response'
master_pub = b'upb/master/request'
worker_sub = b''
worker_pub = b''


last_message = 0
message_interval = 5
counter = 0

station = network.WLAN(network.STA_IF)
station.active(True)

oled.fill(0)

print("Available networks")
print(station.scan())

availalblenetworks = str(station.scan())
#oled.text(str(station.scan()), 0, 0)
        

station.connect(ssid, password)

while station.isconnected() == False:
  pass

# This use Epoch time of January 1, 2000. This is 946,684,800 seconds later than UNIX Epoch time of January 1, 1970.
ntptime.settime()         # This library call sets RTC to ntp time.
machine.RTC().datetime()  # Read the hardware RTC in datetime format.
timestamp = 946684800 + utime.time() # Unis epoch time
timestampid = str(timestamp)[-5:]


print('Connection successful  ')

ipsplited = station.ifconfig()[0].split('.')
idesp32 = ipsplited[2] + "." + ipsplited[3] + "." +str(timestampid)
#print('id : ' + idesp32)
#oled.text(str(station.ifconfig()), 0, 10)
workerid = ""

screen1 = [[0,0, availalblenetworks],[0,16, str(station.ifconfig())]]

def scroll_in_screen(screen):
  for i in range (0, oled_width+1, 4):
    for line in screen:
      oled.text(line[2], -oled_width+i, line[1])
    oled.show()
    if i!= oled_width:
      oled.fill(0)


scroll_in_screen(screen1)

#oled.show()

