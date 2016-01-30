import RPi.GPIO as GPIO
import time
import os

GPIO.setmode(GPIO.BCM)
GPIO.setup(19,GPIO.IN)
GPIO.setup(17, GPIO.OUT)

button_previous = 1
button_current = 1
cp = 0
flag_pressed = 0

while True:
  button_current = GPIO.input(19);
  print button_current
  flag_pressed = button_previous + button_current
  #print flag_pressed

  if (flag_pressed):
    cp += 1
	GPIO.output(17,True)
  else:
    cp = 0

  print cp

  if (button_current and (not button_previous)):
	print 'AAA'
  if (flag_pressed and  cp >= 30):
	print 'REBOOT BY PYTHON SCRIPT    !!!!!'
	os.system("sudo shutdown -r now")
	#os.system("sudo shutdown -h now")
	break

  button_previous = button_current
  time.sleep(0.1)
 
