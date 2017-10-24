import RPi.GPIO as GPIO
import time
import os

GPIO.setwarnings(False)

GPIO.setmode(GPIO.BCM)
GPIO.setup(19,GPIO.IN) # white button
GPIO.setup(26,GPIO.IN) #blue button
GPIO.setup(17, GPIO.OUT)

# reboot
white_previous = 1
white_current = 1
white_cp = -50
white_flag = 0

# shutdown
blue_previous = 1
blue_current = 1
blue_cp = -50
blue_flag = 0

# print 'Loading of fallback buttons\'s python script'
print 'Fallback buttons\'s python script...'

while True:
  white_current = GPIO.input(19);
  #print white_current
  white_flag = white_previous + white_current

  if (white_flag):
    white_cp += 1
    # print white_cp
    # GPIO.output(17,True)
  else:
    white_cp = -50
    # GPIO.output(17,False)

  if (white_current and (not white_previous)):
	print 'Python not defined !'
  if (white_flag and  white_cp > 0):
    GPIO.output(17,False)
    print 'ODI REBOOT BY PYTHON SCRIPT !'
    os.system("sudo shutdown -r now")
    break

  white_previous = white_current

  #############################
  blue_current = GPIO.input(26);
  #print blue_current
  blue_flag = blue_previous + blue_current

  if (blue_flag):
    blue_cp += 1
    # print blue_cp
    # GPIO.output(17,True)
  else:
    blue_cp = -50
    # GPIO.output(17,False)

  if (blue_current and (not blue_previous)):
	print 'Python not defined !'
  if (blue_flag and  blue_cp > 0):
    GPIO.output(17,False)
    print 'ODI SHUTDOWN BY PYTHON SCRIPT !'
    os.system("sudo shutdown -h now")
    break

  blue_previous = blue_current

  time.sleep(0.1)
