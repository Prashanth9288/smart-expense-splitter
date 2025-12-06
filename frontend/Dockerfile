FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build for production
RUN npm run build

EXPOSE 5173

# Just for serving statics or dev, but for prod we typically use nginx. 
# For this task, we can use preview or a simple serve. 
# Let's assume dev/preview for simplicity or serving the build.
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "5173"]
