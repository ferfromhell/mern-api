const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const passport = require('passport');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');




const app = express();

//CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
//Body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(cookieParser());
//mongodb
const dbURI = require('./config/keys').mongoURI;
const reconnectTime= 3500;
const db = mongoose.connection;

function connect(){
  mongoose.connect(dbURI,{ useNewUrlParser: true })
  .catch(() => {});
}

db.on('connecting', () => {
  console.info('Connecting to MongoDB...');
});
db.on('error', (error) => {
  console.error(`MongoDB connection error: ${error}`);
  mongoose.disconnect();
});
db.on('connected', () => {
  console.info('Connected to MongoDB!');
});

db.once('open', () => {
  console.info('MongoDB connection opened!');
});

db.on('reconnected', () => {
  console.info('MongoDB reconnected!');
});

db.on('disconnected', () => {
  console.error(`MongoDB disconnected! Reconnecting in ${reconnectTime / 1000}s...`);
  setTimeout(() => connect(), reconnectTime);
});

connect();
// mongoose.connect(dbURI,{ useNewUrlParser: true })
//   .then(()=> console.log('Connected to mongoDB'))
//   .catch(err => console.log('err'));

// Passport middleware
app.use(passport.initialize());
require('./config/passport')(passport);

//routes
app.use('/api/users',users);
app.use('/api/profile',profile);
app.use('/api/posts',posts);

const port = process.env.PORT || 4444;

app.listen(port, ()=>{
  console.log(`APIServer running in port ${port}`);
});