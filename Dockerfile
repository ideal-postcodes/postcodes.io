FROM node:9

WORKDIR /usr/src/app

COPY package.json .
RUN npm install --only=production --no-package-lock

COPY . .

EXPOSE 8000
CMD [ "node", "server.js" ]