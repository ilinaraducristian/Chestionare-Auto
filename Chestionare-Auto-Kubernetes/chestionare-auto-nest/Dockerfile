FROM node:alpine
WORKDIR /usr/src/app
COPY . .
RUN npm i
ENV NODE_ENV=production
EXPOSE 5000
CMD [ "npm", "start" ]