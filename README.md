</br>
</br>

<p align="center"><img src="./logo.svg"/></p>
</br>
</br>

## Telegram bot and API layer for [you.com](https://you.com) GPT-3 chatbot
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

## Features
The bot responds both in private messages and in conversations in which the bot is a member. *(the bot must have rights to messages)*

In conversations, bot responds to messages with a mention at the beginning of the message. *("**Ettie**, ...", "**Etie**, ...")* or when replying to his message with a question mark at the end of the message *("Ettie, ...**?**", "Etie, ...**?**")*

Also, bot works with inline queries, but only if there is a question mark/exclamation mark/dot at the end of the message.

*("@[bot tag], ... **?**", "@[bot tag], ... **!**", "@[bot tag], ... **.**")*

## Tags
- If you put the tag `#wt` at the end of the message, the bot will not translate the question and answer
- If you put the tag `#ws` at the end of the message, the bot will not add search result buttons to the message
