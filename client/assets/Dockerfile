FROM nginx:alpine

# 1. Borra la página de bienvenida por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# 2. Copia todos tus archivos HTML, CSS y JS
COPY . /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]