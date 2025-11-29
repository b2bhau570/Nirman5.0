//Mongo Db Connection Setup;
const mongoose = require('mongoose');

//Connect to MongoDB and Featch Monogo Url from .env file;
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

     
        if (!mongoUri || typeof mongoUri !== 'string' || mongoUri.trim() === '') {
            console.error('\n\x1b[31mERROR:\x1b[0m MONGO_URI is not set or is invalid.');
            console.error('Please create a `.env` file in the `backend/` folder or set the MONGO_URI environment variable.');
            console.error('You can copy `backend/.env.example` to `backend/.env` and edit it with a valid MongoDB URI.\n');
            process.exit(1);
        }

        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;