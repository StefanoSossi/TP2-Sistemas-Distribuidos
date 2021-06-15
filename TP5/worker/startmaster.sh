#!/bin/bash
SERVER=node-master # name of the server or IP
PORT=8080               # port to wait
TIMEOUT=20               # timeout

echo "waiting for server ${SERVER} on port ${PORT} for ${TIMEOUT} seconds"

./wait-for ${SERVER}:${PORT} -t ${TIMEOUT} -- node index.js
