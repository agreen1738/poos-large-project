#!/bin/bash
set -e

# Load configuration
source .env.deploy

echo "🚀 Deploying backend to $REMOTE_HOST..."

# Build backend locally
cd backend
npm install
npm run build
cd ..

# Create deployment package (exclude src and node_modules)
tar --exclude='./src' --exclude='./node_modules' -czf backend.tar.gz backend

# Upload package
scp backend.tar.gz $REMOTE_USER@$REMOTE_HOST:/var/www/

# SSH into VM to deploy
ssh $REMOTE_USER@$REMOTE_HOST << 'ENDSSH'
  set -e
  cd /var/www
  tar -xzf backend.tar.gz
  rm backend.tar.gz

  cd backend
  npm install --omit=dev
  pm2 restart backend || pm2 start dist/server.js --name backend

  echo "✅ Backend deployed successfully!"
ENDSSH

# Cleanup
rm backend.tar.gz
echo "🧹 Cleaned up local backend package."