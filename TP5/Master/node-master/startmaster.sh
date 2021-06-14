#!/bin/bash
SERVER=mongo # name of the server or IP
PORT=27017               # port to wait
TIMEOUT=5               # timeout

echo "waiting for server ${SERVER} on port ${PORT} for ${TIMEOUT} seconds"

./wait-for ${SERVER}:${PORT} -t ${TIMEOUT} -- node --version
