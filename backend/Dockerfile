FROM node:20-alpine3.19
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app
USER node
ADD --chown=node:node ./dist /home/node/app/
RUN npm install --omit-dev
RUN mkdir /home/node/logs
VOLUME /home/node/logs
ENV LOG_FILENAME="/home/node/logs/ttrpgtools-backend.txt"
ENV LOG_LEVEL="info"
EXPOSE 4000
CMD ["node", "index.js"]