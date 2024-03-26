FROM node:12

WORKDIR /app

COPY package*.json ./

RUN npm install 

COPY . .

ENV PORT=8888

EXPOSE 8888

EXPOSE 1884

EXPOSE 8884

CMD [ "node", "." ]
