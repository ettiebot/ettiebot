</br>
</br>

<p align="center"><img src="./logo.svg"/></p>
</br>
</br>

## Telegram bot and API layer for chatbot from you.com based on **GPT-3**.
Written using **Puppeteer** and **Moleculer**.

Divided into two parts:
- ***worker** (a browser that asks a question and gives an answer)*
- ***bot** (a Telegram bot that lets you ask a question)*

## Installation
1. First, you need to install Redis. It can be installed either locally or on server.

- `sudo apt-get install redis-server`

2. Then, you need to run the `sh install.sh` script on any server. It will install the dependencies for Puppeteer and start Worker in PM2.

3. Then, create a `.env` file, fill it with your data (according to the `.env.example` file), then run the command
- `pm2 restart ettie-worker`

4. Run Telegram bot locally or on any other server. Create `.env` file, fill it with information according to `.env.example` (**note:** you need to connect bot to the same Redis server that Workers is connected to), run:
- `npm install && npm run build`
- `npm run start`

