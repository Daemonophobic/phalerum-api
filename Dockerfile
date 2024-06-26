# Use an official Node.js runtime as the base image
FROM node:20

RUN apt update && apt install -y golang-go

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Build the application
RUN npm run build

# Expose port 3000 for the application
EXPOSE 3000

# Start the application
ENTRYPOINT ["./entrypoint.sh"]
