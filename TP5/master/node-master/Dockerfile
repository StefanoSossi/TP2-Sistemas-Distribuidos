FROM node:latest
RUN apt-get update && apt-get install -y netcat
WORKDIR /app
COPY ./package.json /app/package.json
COPY ./startmaster.sh /app/startmaster.sh
COPY ./wait-for /app/wait-for
RUN npm install && npm ls
COPY ./index.js /app/

CMD ["./startmaster.sh","npm", "start"]
