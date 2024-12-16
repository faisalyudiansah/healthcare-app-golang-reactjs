FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install -g npm@10.8.3
RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

EXPOSE 3001

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

#CMD [ "serve", "-s", "dist" ]