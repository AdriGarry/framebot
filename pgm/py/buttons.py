import RPi.GPIO as GPIO
import os
import time


GPIO.setmode(GPIO.BCM)
GPIO.setup(19, GPIO.IN, pull_up_down=GPIO.PUD_UP)

time.time()
print '1st python script !!'

while True:
	if GPIO.input(19): #whiteButton
	#start counting pressed time
		pressed_time = time.process_time()
	while GPIO.input(19): #call: is button still pressed
		# just to force process wait
		# may be possible use in this time.sleep(1) but I don't have confidence
		pass
	pressed_time = time.process_time()-pressed_time
	if pressed_time<4:
		print 'REBOOT !!'
		#os.system("sudo reboot")
	elif pressed_time>=4:
		print 'SHUTDOWN !!'
		#os.system("sudo halt")
