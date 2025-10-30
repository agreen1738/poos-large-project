#!/bin/bash
set -e

# Load configuration
source .env.deploy

echo "🚀 Deploying frontend to $REMOTE_HOST..."

# Build frontend locally
cd frontend
npm install
npm run build
cd ..

# Package only built files
tar -czf frontend.tar.gz frontend/dist

# Upload package
scp frontend.tar.gz $REMOTE_USER@$REMOTE_HOST:/var/www/

# SSH into VM to deploy
ssh $REMOTE_USER@$REMOTE_HOST << 'ENDSSH'
  set -e
  cd /var/www
  tar -xzf frontend.tar.gz
  rm frontend.tar.gz

  # Replace files in the NGINX html directory
  mkdir -p /var/www/html
  cp -r frontend/dist/* /var/www/html/

  echo "✅ Frontend deployed successfully!"
ENDSSH

# Cleanup
rm frontend.tar.gz
echo "🧹 Cleaned up local frontend package."