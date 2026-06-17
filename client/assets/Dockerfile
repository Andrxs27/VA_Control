FROM nginx:alpine

# 1. Limpiamos cualquier archivo basura que traiga Nginx por defecto
RUN rm -rf /usr/share/nginx/html/*

# 2. Copiamos el CONTENIDO de client/assets directamente a la raíz del servidor
COPY client/assets /usr/share/nginx/html/

