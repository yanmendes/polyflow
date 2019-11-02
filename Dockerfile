FROM node:12.11.0-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install
COPY . .
RUN yarn build
RUN yarn install --production

EXPOSE 3000
CMD [ "yarn", "start:prod" ]
