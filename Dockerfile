FROM node:10.16.0-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY src ./src

RUN yarn
RUN yarn run build

EXPOSE 3050
CMD [ "yarn", "run", "start:prod" ]
