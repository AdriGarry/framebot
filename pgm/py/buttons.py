import RPi.GPIO as GPIO
import time
import os

GPIO.setmode(GPIO.BCM)
GPIO.setup(19,GPIO.IN) # white button
GPIO.setup(16,GPIO.IN) #cancel button
GPIO.setup(17, GPIO.OUT)

# reboot
white_previous = 1
white_current = 1
white_cp = 0
white_flag = 0

# shutdown
red_previous = 1
red_current = 1
red_cp = 0
red_flag = 0

while True:
  white_current = GPIO.input(19);
  #print white_current
  white_flag = white_previous + white_current

  if (white_flag):
    white_cp += 1
	print white_cp
    GPIO.output(17,True)
  else:
    white_cp = 0
    GPIO.output(17,False)

  if (white_current and (not white_previous)):
	print 'AAA'
  if (white_flag and  white_cp > 40):
	print 'REBOOT BY PYTHON SCRIPT    !!!!!'
	os.system("sudo shutdown -r now")
	break

  red_current = GPIO.input(16);
  #print red_current
  red_flag = red_previous + red_current

  if (red_flag):
    red_cp += 1
	print red_cp
    GPIO.output(17,True)
  else:
    red_cp = 0
    GPIO.output(17,False)

  if (red_current and (not red_previous)):
	print 'AAA'
  if (red_flag and  red_cp > 60):
	print 'SHUTDOWN BY PYTHON SCRIPT    !!!!!'
	os.system("sudo shutdown -h now")
	break

  white_previous = white_current
  time.sleep(0.1)
 
