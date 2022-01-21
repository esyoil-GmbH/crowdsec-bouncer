FROM node:14-alpine

EXPOSE 3000

WORKDIR /usr/src/app

RUN npm i typescript -g --loglevel notice
RUN npm i @nestjs/cli -g --loglevel notice

COPY lerna.json .
COPY packages/ ./packages/

RUN npm --prefix packages/backend ci --loglevel notice --unsafe-perm

CMD [ "npm", "--prefix", "packages/backend", "start" ]