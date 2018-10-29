FROM node:latest

WORKDIR /app

COPY package.json /app/package.json
RUN npm install
RUN npm install --save-dev inotify-proxy --no-bin-links

COPY . /app

RUN apt-get update && apt-get install -y postgresql-client

ENTRYPOINT ./wait-for-postgres.sh $DATABASE_URL npm run start-docker
