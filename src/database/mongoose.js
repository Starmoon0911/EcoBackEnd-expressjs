require('dotenv').config();
const mongoose = require('mongoose')
const log = require('@utils/logger.js');


module.exports = {
    async initializeMongoose() {
        log.info(`Connecting to MongoDb...`);
    
        try {
          await mongoose.connect(process.env.MONGO_CONNECTION);
    
          log.info("Mongoose: Database connection Success");
    
          return mongoose.connection;
        } catch (err) {
          log.error("Mongoose: Failed to connect to database", err);
        }
      },
}