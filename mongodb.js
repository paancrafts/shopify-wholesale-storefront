require('dotenv').config();

/* Set up Mongoose */
const mongoose = require('mongoose');

/* Set up connection */
const url = `${process.env.MONGO_URL}`;
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

/* When connected successfully */
mongoose.connection.on('connected', function(){
  console.log("INFO: Mongoose default connection is open to", MONGO_DB);
});

/* When connection error */
mongoose.connection.on('error', function(err){
  console.log(error("ERROR: Mongoose default connection has occured "+err+" error"));
});
/* When disconnected successfully */
mongoose.connection.on('disconnected', function(){
  console.log("Mongoose default connection is disconnected");
});

/* When application is closed disconnect from db */
process.on('SIGINT', function(){
  mongoose.connection.close(function(){
      console.log("INFO: Mongoose default connection is disconnected due to application termination");
      process.exit(0)
  });
});