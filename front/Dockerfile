FROM nginx:stable-alpine as build
WORKDIR /app
COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY ./dist /usr/share/nginx/html
ENV NODE_ENV=production
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]