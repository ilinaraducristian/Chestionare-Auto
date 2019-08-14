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
    "11" "Remove node_modules" \
    "12" "Fix permissions" \
    "13" "Import database data" \
    2>&1 1>&3)
  exit_status=$?
  exec 3>&-
  case $exit_status in
    $DIALOG_CANCEL)
      clear
      exit
      ;;
    $DIALOG_ESC)
      clear
      exit
      ;;
  esac
  case $selection in
    0 )
      clear
      echo "Program terminated."
      ;;
    1 )
      sudo systemctl start docker
      ;;
    2 )
      sudo systemctl stop docker
      ;;
    3 )
      docker-compose up -d
      ;;
    4 )
      docker-compose stop
      ;;
    5 )
      docker-compose down
      ;;
    6 )
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
      docker exec chestionare-auto_backend_1 npm --loglevel=error i;
      docker exec chestionare-auto_frontend_1 npm --loglevel=error i;
      ;;
    11 )
      rm -rf ./Chestionare-Auto-Backend/node_modules;
	  rm -rf ./Chestionare-Auto-Frontend/node_modules;
      ;;
    12 )
      sudo chown -R reydw *
      ;;
    13 )
      collections=(a b c d)
      for i in "${collections[@]}"; do
        docker cp "category_$i.json" chestionare-auto_database_1:/
        docker exec chestionare-auto_database_1 mongoimport -d chestionare_auto -c "category_$i" --file "category_$i.json" --jsonArray
        docker exec chestionare-auto_database_1 rm "category_$i.json"
      done
      ;;
  esac
done