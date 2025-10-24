# Wealth Tracker APP

A platform to manage your wealth

## Folder Structure

```
├── /backend
├── /frontend
├── /private
├── .env.deploy
├── .gitignore
├── deploy_backend.sh
├── deploy_frontend.sh
├── deploy.sh
└── README.md
```

## Dependencies

Documentation for backend and frontend dependencies can be found in their respective README.md files.

## Deployment

This application is deployed on a DigitalOcean Droplet running ubuntu 22.04 LTS. Deployment is handled through the shell scripts: `deploy.sh`, `deploy_backend.sh`, and `deploy_frontend.sh`.

### 1. .env.deploy file set up

These values are needed to successfully run the deployment scripts.

```
REMOTE_USER = name
REMOTE_HOST = ip_address
REMOTE_PASS = password
REMOTE_BACKEND_PATH = vm_backend_path
REMOTE_FRONTEND_PATH = vm_frontend_path
```

_Note: The remote password is not automatically injected in the scripts. Developers will have to manually insert it when prompted during the deployment process._

### 2. Script Usage

Deploying both the frontend and backend:

```bash
bash deploy.sh
```

Deploying only the frontend:

```bash
bash deploy_frontend.sh
```

Deploying only the backend:

```bash
bash deploy_backend.sh
```
