FROM node:18

WORKDIR /opt/app

RUN apt update

RUN apt install -y git

RUN git clone https://github.com/dortanes/yandex-alice-client

RUN cd yandex-alice-client && yarn

RUN apt install -y ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils xvfb

RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

RUN apt install ./google-chrome-stable_current_amd64.deb -y

RUN rm -rf ./google-chrome-stable_current_amd64.deb

RUN rm -rf /opt/app/inquirer
RUN mkdir -p /opt/app/inquirer
RUN mkdir -p /opt/app/inquirer/node_modules

WORKDIR /opt/app/inquirer

COPY package*.json ./

COPY .env ./

RUN yarn

COPY . .

RUN npm run build

RUN chmod -R o+rwx node_modules/puppeteer/

# RUN npm install puppeteer

ENV DISPLAY :99

ADD run.sh /run.sh

RUN chmod 777 /run.sh

ENTRYPOINT [ "sh" ]

CMD [ "run.sh" ]