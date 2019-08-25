# Chestionare Auto

## Table of Contents

- [What is Chestionare Auto?](#what-is-chestionare-auto)
- [How to use this project](#how-to-use-this-project)
  - [Start the platform using the GUI](#start-the-platform-using-the-gui)
  - [Start the platform using the terminal](#start-the-platform-using-the-terminal)
- [License](#license)

## What is Chestionare Auto?

Chestionare Auto is a full stack application built with Angular, NestJS and MongoDB. It can be deployed on Heroku or as serices on Kubernetes.

## How to use this project

### Start the platform using the GUI

Dependencies: docker, docker-compose, node, npm, ncurses, dialog
Optional for step 5: caregory#.json

1. Run docker_manager.sh
2. Start Docker service
3. Install modules
4. Start containers
5. Import database data

### Start the platform using the terminal

Dependencies: docker, docker-compose, node, npm
Optional for step 4: caregory#.json

1. Start Docker service
2. Install node modules:

```
$ cd ./Chestionare-Auto-Frontend && npm i
$ cd ./Chestionare-Auto-Backend && npm i
```

3. Start docker containers:

```
$ docker-compose up -d
```

4. Import database data:

```
$ for i in "${collections[@]}";
$ do
$   docker cp "category_$i.json" chestionare-auto_database_1:/
$   docker exec chestionare-auto_database_1 \
$   mongoimport \
$   -d chestionare_auto \
$   -c "category_$i" \
$   --file "category_$i.json" --jsonArray
$   docker exec chestionare-auto_database_1 rm "category_$i.json"
$ done
```

## License

[License information](https://github.com/Reydw/Chestionare-Auto/blob/master/LICENSE) for
this project.
