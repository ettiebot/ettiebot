</br>
</br>

<p align="center"><img src="./logo.svg"/></p>
</br>
</br>

## Telegram bot and API layer for [you.com](https://you.com) GPT-3 chatbot
Written using **Puppeteer**, **Moleculer** and **Google Cloud**

Divided into two parts:
- ***inquirer** (a browser that asks a question and gives an answer)*
- ***client** (a Telegram bot that lets you ask a question)*

## Installation
- Make sure you have **Redis** and **Docker** installed
- You need to create an `.env` file following the example of `.env.example` in `client` and `inquirer`
- Create an account at [Google Cloud](https://cloud.google.com), **enable Speech Recognition API**, create a key, and upload the key as a JSON file to the root of `client` called `gcCredentials.json`
- Run `sh start.sh` in `inquirer` directory to deploy the browser into the Docker container
- Run `sh start.sh` in `client` directory to deploy the bot into the Docker container

## Features
- Can reply both in private messages and in group chats (permission to read messages is required)
- Responds in group chats with mention only (see `client/methods/actions/checkMention.actions.ts`)or when replying to his message
- Works with inline queries
- Can answer voice messages (thanks to Google Cloud)
- It has an intuitive UI with which users can customize the bot as they wish
- Choose from a variety of languages

## Commands
- `/start` - Starts a dialog with the user
- `/menu` - Sends the user a menu with settings
