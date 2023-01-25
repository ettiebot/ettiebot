#
# This script only needs to be executed
# to run the code as a worker
# (a browser getting answers to questions)
#

# Update package list
sudo apt update
# Install dependencies
sudo apt install -y ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils
# Install Xvfb
sudo apt install -y xvfb
# Install Node.js
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs
# Install project dependencies
npm install
# Install pm2 globally
npm i -g pm2
# Build project
npm run build
# Start project
pm2 start worker.ecosystem.config.js
# Setting up pm2 to start on boot
pm2 startup