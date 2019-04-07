print:
	@echo "up, down, stop, remove, inspect_backend, inspect_frontend, db_client, install, clean"

up:
	@docker-compose up -d

down stop:
	@docker-compose $@

remove: down
	@docker image rm chestionare-auto_frontend chestionare-auto_backend

inspect_backend:
	@docker attach --sig-proxy=false chestionare-auto_backend_1

inspect_frontend:
	@docker attach --sig-proxy=false chestionare-auto_frontend_1

install:
	@cd ./Chestionare-Auto-Backend; npm --loglevel=error i
	@cd ./Chestionare-Auto-Frontend; npm --loglevel=error i

clean:
	@rm -rf ./Chestionare-Auto-Backend/node_modules
	@rm -rf ./Chestionare-Auto-Frontend/node_modules