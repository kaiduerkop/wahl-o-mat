#!/bin/sh

# Start the Node.js admin API in the background
node /app/server/server.js &

# Start nginx in the foreground
exec nginx -g 'daemon off;'
