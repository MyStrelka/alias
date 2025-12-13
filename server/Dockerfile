FROM node:24-alpine

WORKDIR /app

# Копируем package.json из папки server
COPY ./package*.json .

RUN npm install

# Копируем весь код сервера
COPY . .

EXPOSE 3000
CMD ["node", "index.js"]