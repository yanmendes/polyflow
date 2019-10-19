FROM node:12.11.0-alpine

WORKDIR /usr/src/app

COPY . .

RUN yarn
RUN yarn run build

EXPOSE 3050
CMD [ "yarn", "run", "start:prod" ]
