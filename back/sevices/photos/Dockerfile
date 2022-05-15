FROM node:15.4 as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY dist ./dist/
COPY .production.env ./
VOLUME:
      - ${PWD}/app/photos

EXPOSE 2000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]