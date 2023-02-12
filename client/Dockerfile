FROM node:18-alpine

RUN mkdir -p /opt/app/node_modules

WORKDIR /opt/app

COPY package*.json ./

COPY .env ./

RUN npm i -g yarn

RUN yarn

COPY . .

RUN npm run build

ADD run.sh /run.sh

RUN chmod 777 /run.sh

ENTRYPOINT [ "sh" ]

CMD [ "run.sh" ]