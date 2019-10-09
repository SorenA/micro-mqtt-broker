# Base image - Alpine with node 7
FROM node:7-alpine

# Copy in package.json file
COPY ./src/package.json /mqtt/package.json
WORKDIR  /mqtt

# Update packages and install dependencies
RUN apk update && \
    apk add make gcc g++ python git zeromq-dev krb5-dev && \
    npm install --unsafe-perm --production && \
    apk del make gcc g++ python git

# Copy in application
COPY ./src /mqtt/

# Expose ports
EXPOSE 1883
EXPOSE 8883

# Run application
ENTRYPOINT ["node", "index.js"]
