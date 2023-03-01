const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
var cors = require('cors')
const fileUpload = require("express-fileupload");
const app = express();


const errorMiddleware = require("./middleware/error");

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({ path: "./config/.env" });
}

app.use(cors())
app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true,limit:'50mb' }));
app.use(fileUpload());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

//Main Route Import
const main = require('./routes/main.route')
// const user = require("./routes/user.route");

app.use(main)


// App major usages
app.use(cookieParser());

//Check port
app.get('/', (req, res) => {
    res.send('Hello World!')
});

// Handle Errors
app.use(errorMiddleware);

module.exports = app;