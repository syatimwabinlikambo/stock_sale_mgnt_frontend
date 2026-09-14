FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Remove default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy frontend files
COPY . /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]