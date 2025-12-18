# Этап 1: Сборка React
FROM node:24-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Принимаем переменные для сборки (адреса сервера)
ARG VITE_SERVER_URL
ARG VITE_PB_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_PB_URL=$VITE_PB_URL

RUN npm run build

# Этап 2: Запуск Nginx
FROM nginx:alpine
# Копируем собранный сайт
COPY --from=build /app/dist /usr/share/nginx/html
# Копируем конфиг Nginx (см. ниже)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]