FROM node:16-alpine3.15 AS scratch
ENV PATH="${PATH}:/usr/src/app/node_modules/.bin:/usr/local/lib/node_modules/.bin"
WORKDIR /usr/src/app


FROM scratch as builder

COPY package.json ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

FROM scratch
EXPOSE 3000

COPY --from=BUILDER --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=BUILDER --chown=node:node /usr/src/app/dist .
COPY --from=BUILDER --chown=node:node /usr/src/app/package.json .

CMD [ "node", "main.js" ]