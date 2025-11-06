# WealthTracker API

This document serve as a guide towards succesfully running the backend.

## Folder Structure

```
├── /dist
├── /node_modules
├── /src
│   ├── /controllers
│   │   ├── accountController.ts
│   │   ├── analyticsController.ts
│   │   ├── authController.ts
│   │   ├── transactionController.ts
│   │   └── userController.ts
│   ├── /middleware
│   │   └── authMiddleware.ts
│   ├── /models
│   │   ├── Accounts.ts
│   │   ├── Transactions.ts
│   │   └── User.ts
│   ├── /routes
│   │   ├── accountRoutes.ts
│   │   ├── analyticsRoutes.ts
│   │   ├── authRoutes.ts
│   │   ├── budgetRoutes.ts
│   │   ├── transactionsRoutes.ts
│   │   └── userRoutes.ts
│   ├── /types
│   │   └── express.d.ts
│   ├── /utils
│   │   └── messageHandler.ts
│   ├── app.ts
│   ├── database.ts
│   └── server.ts
├── /tests
│   ├── accounts.test.ts
│   ├── analytics.test.ts
│   ├── auth.test.ts
│   ├── budget.test.ts
│   ├── transactions.test.ts
│   └── user.test.ts
├── .env
├── .gitignore
├── .prettierrc
├── jest.config.js
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.build.json
└── tsconfig.json
```

## Dependencies

The backend uses **Express.js** to develop the program's API, **MongoDB** as the database, and **TypeScript** for type safety and improved developer experience.

## Setting up the Environment

### 1. Cloning the Repository

```bash
git clone git@github.com:agreen1738/poos-large-project.git
```

### 2. Downloading the dependencies

The Node Package Manager makes the process of downloading the dependecies easy with this command:

```bash
npm install
```

_Note: NodeJS must be installed in order for this to work. Instructions to install it can be found here: https://nodejs.org/en/download. The instruction above assume that user is within the backend directory. If they are not, they can use the command: `cd backend` before installing the dependencies._

### 3. Setting up the .env file

The dotenv file needs to have 4 values, including the port number where the backend will be running, the database's name, the database's uri, and the api's jwt secret key.

```bash
PORT = 5000                                   # api port value
MONGO_DB_NAME = WealthTrackerDB               # database name
MONGO_URI = mongodb+srv://db_user:exampleuri  # database uri
JWT_SECRET = 47c8bbbd1d8a442926eccc           # jwt secret value
```

_Optionals_: Before launching the backend, developers can use the command below to create their JWT secret key. Although the key can be any value, we recommend making it something that's hard to guest.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

_Example Result:_

```bash
47c8bbbd1d8a442926eccc57abfb87ead2f00cc2db05d446e9666201655a1618
```

### 4. Setting up the .env.deploy file

This file is needed to deploy the api to the virtual machine of your choice. The deploy script assumes that the user is using ssh to connect.

```bash
REMOTE_USER = user             # name of VM user
REMOTE_HOST = 123.456.789.999  # VM ip address
REMOTE_PASS = greatest_pwd     # password to connect to VM
```

_Note: When deploying, user will have to manually enter their password. While keeping the password in the .env.deploy file is not necessary, we recommend doing so in order to easily retrieve it._

## Running and Building

Running the application using typescript:

```bash
npm run dev
```

Building before pushing to production:

```bash
npm run build
```

## Example of API Interaction

Registering a user (POST `/api/register`):

Request:

```json
{
    "name": "Gradi Mbuyi",
    "email": "gradimbuyi@outlook.com",
    "password": "fakepassword123"
}
```

Response:

If user exist:

```json
{
    "error": "email already exist"
}
```

If user does not exist:

```json
{
    "success": "user created successfully"
}
```
