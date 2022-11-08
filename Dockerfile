FROM alpine:3.16
RUN apk add --update nodejs npm
WORKDIR /usr/src/app
COPY package.json .
RUN npm install
COPY . ./
EXPOSE $PORT
CMD ["npm", "start"]
