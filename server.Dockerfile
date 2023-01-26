FROM node:18-alpine

RUN mkdir -p /opt/app/node_modules

WORKDIR /opt/app

COPY package*.json ./

COPY .env ./

RUN npm install

COPY . .

RUN npm run build

CMD [ "node", "build/telegramBot/index.js" ]