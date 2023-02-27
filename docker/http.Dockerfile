FROM node:18

# Create app directory
WORKDIR /opt/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn
RUN npm i -g typescript

COPY . .

RUN tsc -p tsconfig.release.json

ENV NODE_ENV=production
ENV NODE_TYPE=http

EXPOSE 3000
CMD [ "node", "build/src/main.js" ]