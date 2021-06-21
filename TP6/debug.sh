#!/bin/sh

docker swarm leave --force
wait
docker image rm master/node-master
wait
./master/build.sh
wait
docker swarm init
docker stack deploy -c docker-compose.yml  ds-swarm
