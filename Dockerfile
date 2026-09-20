FROM nginx:1.27-alpine

ARG VERSION=1.0.20260920

COPY . /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
