</br>
</br>

<p align="center"><img src="./logo.svg"/></p>
</br>
</br>

## Ettie - Smart personal assistant on GPT-3

Uses [YouChat](https://you.com) AI and [ChatAPI](https://github.com/ettiebot/chatapi)

Divided into parts:
  - **http** (HTTP server for [Ettie Desktop](https://github.com/ettiebot/desktop))
  - soon: telegram bot

## Installation
- Make sure you have **Docker** installed
- Store config files in `config/production` directory like in `config/development` folder
- Create an account at [Google Cloud](https://cloud.google.com), **enable Speech Recognition API**, **Translate API** and **Dialogflow**, create a key, and upload the key as a JSON file called `gc.credentials.json` to `config/production`
- Run ``docker-compose up -d`` for running application as Docker containers
