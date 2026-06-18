FROM nginx:alpine

# 1. Clear the default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# 2. Copy your specific frontend assets folder into the nginx directory
COPY client/assets/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]