FROM nginx:alpine

# Borramos lo que trae Nginx por defecto para limpiar la raíz
RUN rm -rf /usr/share/nginx/html/*

# Creamos la estructura limpia
RUN mkdir -p /usr/share/nginx/html/client/assets

# Copiamos todo lo que está en tu carpeta actual a la ruta destino
COPY . /usr/share/nginx/html/client/assets/