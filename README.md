</br>
</br>

<p align="center"><img src="./logo.svg"/></p>
</br>
</br>

## Ettie - Smart GPT-3 chatbot
Written using **Puppeteer** and **Google Cloud**.

Uses [YouChat](https://you.com) AI

Divided into parts:
- **inquirer** (a browser that asks a question and gives an answer)
- clients
  - **http** (HTTP client)
  - **ws** (WebSockets client for [Ettie Desktop](https://github.com/ettiebot/desktop))
  - **client** (Telegram bot) **unready yet**
## Installation
- Make sure you have **Redis** and **Docker** installed
- Store config files in `config/production` directory like in `config/development` folder
- Create an account at [Google Cloud](https://cloud.google.com), **enable Speech Recognition API**, **Translate API** and **Dialogflow**, create a key, and upload the key as a JSON file called `gc.credentials.json` to `config/production`
- Run ``docker-compose up -d`` for running application as Docker containers
