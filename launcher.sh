#!/bin/bash
#Basic Smog launch script
#Author: David

SMOG_DIR="/node/smog" #smog directory
SMOG_BIN="server.js" #smog executable file name
SMOG_ERR="/var/log/smog.err.log" #last instance error log
SMOG_OUT="/var/log/smog.out.log" #last instance stdout sink
SMOG_CMD="node ./${SMOG_BIN}"
SMOG_BLD='\e[0;01m'
SMOG_END='\e[0m'


function smogStart {
  if pgrep -f "${SMOG_CMD}";then
    echo "Process is already running!"
  else
    cd ${SMOG_DIR}
    ./${SMOG_BIN}
  fi
}

function smogDaemon {
  if pgrep -f "${SMOG_CMD}";then
    echo "Process is already running!"
  elif pgrep -f "${SMOG_CMD}" > /dev/null = 1;then
    #echo "Process is not running"
    cd ${SMOG_DIR}
    nohup ./${SMOG_BIN} > ${SMOG_OUT} 2> ${SMOG_ERR} < /dev/null &
    echo "Smog started in background.."
  else
    echo "Error starting process!"
    exit 1
  fi
}

function smogKill {
  if pgrep -f "${SMOG_CMD}";then
    if pkill -f "${SMOG_CMD}";then
      echo "Killed process"
    else
      echo "Error killing process!"
      exit 1
    fi
  else
    echo "Process is not running - there is nothing to kill"
  fi
 exit
}

function smogUsage {
  echo -e "    ${SMOG_BLD}${0}${SMOG_END} [MODE]"
  echo ""
  echo -e "    ${SMOG_BLD}start${SMOG_END}\tStarts process in foreground"	
  echo -e "    ${SMOG_BLD}daemon${SMOG_END}\tStarts as daemon silently in the background"
  echo -e "    ${SMOG_BLD}kill${SMOG_END}\tKills process started as daemon"
  echo -e "    ${SMOG_BLD}help${SMOG_END}\tShows this screen"
  echo ""
  echo "   Give no arguments to run in foreground"
}

if [ "$#" == "0" -o "$#" == "1" -a "$1" == "start" ]; then
  smogStart
elif [ "$#" == "1" -a "$1" == "daemon" ]; then
  smogDaemon
elif [ "$#" == "1" -a "$1" == "kill" ]; then
  smogKill
elif [ "$#" == "1" -a "$1" == "help" ]; then
  smogUsage
else
  echo "Use ${SMOG_BLD}${0} help${SMOG_END} for usage info"
fi

