FROM node:12.11.0-alpine as build

WORKDIR /usr/src/app

RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers autoconf automake make nasm python git && \
  npm install --quiet node-gyp -g

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install
COPY . .
RUN yarn build
RUN yarn install --production

FROM node:12.11.0-alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app .

EXPOSE 3000
CMD [ "yarn", "start:prod" ]
