FROM node:18

WORKDIR /opt/app

RUN apt update
RUN apt install -y git

RUN git clone https://github.com/ettiebot/ettiebot .
RUN git clone https://github.com/dortanes/yandex-alice-client
RUN cd yandex-alice-client && yarn

RUN rm -rf /opt/app/client
RUN mkdir -p /opt/app/client
RUN mkdir -p /opt/app/client/node_modules

WORKDIR /opt/app/client

COPY . .

COPY package*.json ./

COPY .env ./

RUN cd /opt/app/client

RUN yarn

RUN npm run build

ADD run.sh /run.sh

RUN chmod 777 /run.sh

ENTRYPOINT [ "sh" ]

CMD [ "run.sh" ]

