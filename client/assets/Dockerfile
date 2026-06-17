FROM nginx:alpine

# 1. Limpiar el contenido por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# 2. Copiar todo en la raíz (para que el dominio principal funcione)
COPY . /usr/share/nginx/html/

# 3. Crear la estructura exacta que me pides (/client/assets) dentro del servidor
RUN mkdir -p /usr/share/nginx/html/client/assets

# 4. Duplicar los archivos en esa ruta para que tu link largo cargue sin dar 404
COPY . /usr/share/nginx/html/client/assets/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]