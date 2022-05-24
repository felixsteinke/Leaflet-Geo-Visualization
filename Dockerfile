FROM node:12-alpine as builder

WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY ./ ./

FROM nginx:alpine as runner

COPY --from=builder /app/ /usr/share/nginx/html
