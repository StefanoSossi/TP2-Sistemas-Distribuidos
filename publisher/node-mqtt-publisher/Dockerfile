FROM node:latest
WORKDIR /app
COPY ./package.json /app/package.json
RUN npm install && npm ls
COPY ./index.js /app
CMD ["npm", "start"]

