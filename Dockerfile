FROM nginx:alpine

WORKDIR /usr/share/nginx/html

RUN rm -rf /usr/share/nginx/html/*

COPY . /usr/share/nginx/html/

COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]