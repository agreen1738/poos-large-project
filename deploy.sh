#!/bin/bash
set -e

# Load environment variables
source .env.deploy

echo "======================================"
echo "🌍  Starting full deployment to $REMOTE_HOST"
echo "======================================"

# --- Deploy Backend ---
echo "--------------------------------------"
echo "📦 Deploying Backend..."
echo "--------------------------------------"

bash ./deploy_backend.sh

echo "✅ Backend deployment complete."
echo

# --- Deploy Frontend ---
echo "--------------------------------------"
echo "💻 Deploying Frontend..."
echo "--------------------------------------"

bash ./deploy_frontend.sh

echo
echo "======================================"
echo "🎉 All deployments completed successfully!"
echo "Backend: $REMOTE_BACKEND_PATH"
echo "Frontend: $REMOTE_FRONTEND_PATH"
echo "======================================"
