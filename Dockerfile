FROM node:latest

LABEL maintainer = "Kyupin"
LABEL description = "Docker file to run an image of my cards-api project"
LABEL cohort = "cohort-18"

WORKDIR /usr/src/app

COPY . .

EXPOSE 3000/tcp

RUN npm install express express-jwt jsonwebtoken dotenv

CMD ["node", "app.js" ]
