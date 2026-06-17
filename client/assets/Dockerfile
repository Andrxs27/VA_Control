FROM nginx:alpine

# Limpiamos cualquier archivo por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiamos todo el contenido de tu carpeta (incluyendo el nuevo index.html y la carpeta pages)
COPY . /usr/share/nginx/html/