FROM node

COPY src /sync/src/
COPY package.json /sync/

RUN cd /sync; \
    npm i

WORKDIR /sync

CMD ["npm","run","start"]