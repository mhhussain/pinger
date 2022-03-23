FROM node:latest

WORKDIR /home/node/app

COPY . .

ENV NODE_ENV=production
ENV PORT=5005
ENV MORGAN_FORMAT=tiny
ENV COORDINATOR_URL=localhost
ENV COORDINATOR_PORT=5001

ENTRYPOINT ["npm", "run", "start"]