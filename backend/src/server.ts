import dotenv from 'dotenv';
import app from './app.ts';
import { connect_db } from './database.ts';

dotenv.config();

const port = process.env.PORT || 5000;
const mongo_uri = process.env.MONGO_URI;

// Connect to database
await connect_db(mongo_uri as string);

// Start server
app.listen(port as Number, () => {
    console.log(`Server is listening on port ${port}`);
});
