</br>
</br>

<p align="center"><img src="./logo.svg"/></p>
</br>
</br>

## Telegram bot and API layer for chatbot from you.com based on **GPT-3**.
Written using **Puppeteer** and **Moleculer**.

Divided into two parts:
- ***client** (a browser that asks a question and gives an answer)*
- ***server** (a Telegram bot that lets you ask a question)*

## Installation
**Make sure you have Docker installed.**

1. You need to install Redis. It can be installed either locally or on other server

- `sudo apt-get install redis-server`

2. After that, you need to create an `.env` file following the example of `.env.example`

3. Run `sh start_client.sh` script to deploy a browser in Docker container

3. Run `sh start_server.sh` script to deploy a bot in Docker container

