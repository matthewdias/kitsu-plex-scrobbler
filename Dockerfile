FROM node:latest

WORKDIR /app

COPY package.json /app/package.json
RUN npm install
RUN npm install --save-dev inotify-proxy --no-bin-links
RUN npm install --global npm-run-all

COPY . /app

ENTRYPOINT ["npm", "run", "start-docker"]
