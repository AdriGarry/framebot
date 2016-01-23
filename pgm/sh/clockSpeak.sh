#!/bin/bash

HR=$(datez +%1)
MIN=$(date +%M)
MD=$(date +%p)
hour clock
String="The time is $HR   $MIN   $MD"
#Execute mpg123 with a url that will return am mpg srteam to be played
# The -q flag suppresses any text output
mpg123 -q 'http://translate.google.com/translate_tts?tl=en&q='"$String"