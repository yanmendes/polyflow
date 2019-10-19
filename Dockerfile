FROM node:12.11.0-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN npm install --production

COPY node_modules .
COPY dist .

EXPOSE 3000
CMD [ "yarn", "start:prod" ]
