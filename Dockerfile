FROM node:latest

WORKDIR /app

COPY package.json /app/package.json

RUN npm install

COPY . /app

ENTRYPOINT ["npm", "start"]
