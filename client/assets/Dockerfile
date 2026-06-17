FROM nginx:alpine

# Limpiar la carpeta por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia los archivos buscando directamente en la ruta completa
COPY client /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]