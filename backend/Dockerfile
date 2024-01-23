# Use the official Node.js 14 image as a parent image
FROM node:16-slim

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files from your local directory into the container
COPY package*.json ./

# Install dependencies in the container
RUN npm install

# Copy the rest of your code from your local directory into the container
COPY . .

# Your application listens on port 8080. You want to expose this port on the Docker container.
EXPOSE 8080

# Define the command to run your app using CMD which defines your runtime
# Here we will use the basic `node server.js` to start your server
CMD ["node", "server.js"]
