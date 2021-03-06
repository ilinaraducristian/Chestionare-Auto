#!/bin/bash
DIALOG_CANCEL=1
DIALOG_ESC=255
HEIGHT=20
WIDTH=0

display_result() {
  dialog --title "$1" \
    --no-collapse \
    --msgbox "$result" 0 0
}

while true; do
  exec 3>&1
  selection=$(dialog \
    --backtitle "Docker Manager" \
    --title "Menu" \
    --clear \
    --cancel-label "Exit" \
    --menu "Please select:" $HEIGHT $WIDTH 20 \
    "1" "Start Docker service" \
    "2" "Stop Docker service" \
    "3" "Start containers" \
    "4" "Stop containers" \
    "5" "Remove containers" \
    "6" "Restart containers" \
    "7" "Node TTY" \
    "8" "Angular TTY" \
    "9" "Mongo TTY" \
    "10" "Install modules" \
    "11" "Remove modules" \
    "12" "Fix permissions" \
    "13" "Import database data" \
    "14" "Build production" \
    "15" "Start Angular environment" \
    "16" "Start Nest environment" \
    "17" "Start Mongo environment" \
    2>&1 1>&3)
  exit_status=$?
  exec 3>&-
  case $exit_status in
    $DIALOG_CANCEL)
      clear;
      exit
      ;;
    $DIALOG_ESC)
      clear;
      exit
      ;;
  esac
  case $selection in
    0 )
      clear;
      echo "Program terminated."
      ;;
    1 )
      clear;
      sudo systemctl start docker
      ;;
    2 )
      clear;
      sudo systemctl stop docker
      ;;
    3 )
      clear;
      docker-compose up -d
      ;;
    4 )
      clear;
      docker-compose stop
      ;;
    5 )
      clear;
      docker-compose down
      ;;
    6 )
      clear;
      docker-compose restart
      ;;
    7 )
      clear;
      docker attach --sig-proxy=false chestionare-auto_backend_1
      ;;
    8 )
      clear;
      docker attach --sig-proxy=false chestionare-auto_frontend_1
      ;;
    9 )
      clear;
      docker attach --sig-proxy=false chestionare-auto_database_1
      ;;
    10 )
      clear;
      cd ./Chestionare-Auto-Frontend && npm i;
      cd ../Chestionare-Auto-Backend && npm i;
      ;;
    11 )
      clear;
      rm -rf ./Chestionare-Auto-Backend/node_modules;
	    rm -rf ./Chestionare-Auto-Frontend/node_modules;
      ;;
    12 )
      clear;
      sudo chown -R reydw *
      ;;
    13 )
      clear;
      collections=(a b c d)
      for i in "${collections[@]}"; do
        docker cp "category_$i.json" chestionare-auto_database_1:/
        docker exec chestionare-auto_database_1 mongoimport -d chestionare_auto -c "category_$i" --file "category_$i.json" --jsonArray
        docker exec chestionare-auto_database_1 rm "category_$i.json"
      done
      ;;
    14 )
      clear;
      cd ./Chestionare-Auto-Frontend && npm run build:prod
      cd ../Chestionare-Auto-Backend && npm run build:prod
      ;;
    15 )
      clear;
      docker run --rm -it -v $(pwd)/Chestionare-Auto-Frontend:/usr/src reydw/angular-dev
      ;;
    16 )
      clear;
      docker run --rm -it -v $(pwd)/Chestionare-Auto-Backend:/usr/src reydw/nest-dev
      ;;
    17 )
      clear;
      docker run --rm -it -v $(pwd):/usr/src mongo bash
      ;;
  esac
done