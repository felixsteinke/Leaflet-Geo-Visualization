FROM node:12-alpine as builder
MAINTAINER Felix Steinke <steinke.felix@yahoo.de>

WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]

RUN npm install

COPY ./ ./

FROM nginx:alpine as runner
MAINTAINER Felix Steinke <steinke.felix@yahoo.com>

COPY --from=builder /app/ /usr/share/nginx/html
