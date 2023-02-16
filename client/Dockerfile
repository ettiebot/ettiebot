FROM node:18

WORKDIR /opt/app

COPY . .

COPY package*.json ./

COPY .env ./

RUN yarn

RUN npm run build

ADD run.sh /run.sh

RUN chmod 777 /run.sh

ENTRYPOINT [ "sh" ]

CMD [ "run.sh" ]
