# WealthTracker API

This document serve as a guide towards succesfully running the backend.

## Folder Structure

```
├── /node_modules
├── /src
│   ├── /controllers
│   │   ├── accountController.ts
│   │   └── authController.ts
│   ├── /middleware
│   │   └── authMiddleware.ts
│   ├── /models
│   │   ├── Accounts.ts
│   │   └── User.ts
│   ├── /routes
│   │   ├── accountRoutes.ts
│   │   └── authRoutes.ts
│   ├── /types
│   │   └── express.d.ts
│   ├── /utils
│   │   └── messageHandler.ts
│   ├── app.ts
│   ├── database.ts
│   └── server.ts
├── .env
├── .gitignore
├── .prettierrc
├── package-lock.json
├── package.json
├── README.md
└── tsconfig.json
```

## Dependencies

The backend uses **Express.js** to develop the program's API, **MongoDB** as the database, and **TypeScript** for type safety and improved developer experience.

## Setting up the Environment

### 1. Downloading the dependencies

The Node Package Manager makes the process of downloading the dependecies easy with this command:

```bash
npm install
```

_Note: NodeJS must be installed in order for this to work. Instructions to install it can be found here: https://nodejs.org/en/download_

### 2. .env file set up

The dotenv file needs to have 4 values, including the port number where the backend will be running, the database's name, the database's uri, and the api's jwt secret key.

```
PORT = 5000
MONGO_DB_NAME = db_name
MONGO_URI = mongodb+srv://db_user:exampleuri
JWT_SECRET = 47c8bbbd1d8a442926eccc57abfb87ead2f00cc2db05d446e9666201655a1618
```

_Optionals_: Before launching the backend, developers can use the command below to create their JWT secret key. Although the key can be any value, we recommend making it something that's hard to guest.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

_Example Result:_

```bash
47c8bbbd1d8a442926eccc57abfb87ead2f00cc2db05d446e9666201655a1618
```

## Running and Building

In order to launch the app in the local environment, use the command:

```bash
npm run dev
```
