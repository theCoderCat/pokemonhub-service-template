// server.js

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var redis = require('redis');
var mongoose   = require('mongoose');
var exec = require('child_process').exec;
var responseTime = require('response-time');
var errorHandler = require('errorhandler');
var util = require("./app/logics/libs/Common.js");
var config = require('./Config.js');
var busboy = require('connect-busboy');
var winston = require('winston');
require('winston-logstash');

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, { handleExceptions: true,
     humanReadableUnhandledException: true ,service_name : require("./Config.js").service_name} );

winston.add(winston.transports.File, { filename: './logs/somefile.log' ,service_name : require("./Config.js").service_name ,handleExceptions: true,
     humanReadableUnhandledException: true, level: 'error'});

util.getIP();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('views', './app/templates');
app.set('view engine', 'jade');
app.use(express.static(process.cwd() + '/app/public'));
app.use(busboy());

app.use(responseTime(function (req, res, time) {
  	var stat = (req.url).toLowerCase()
    .replace(/[:\.]/g, '');
  	console.log(stat  + " "+ time);
}));

if (require("./Config.js").mode == "development"){
	app.use(errorHandler({ dumpExceptions: true, showStack: true }));
} else {
	app.use(errorHandler());
}

//setting redis - cache object
var redis_config = require("./Config.js").redis_config;
if (redis_config.enable){
  var redis_client = redis.createClient( redis_config.port, redis_config.host);
  redis_client.on('connect', function(){
    console.log("Connected to Redis");
  });
}

//setting mongo - persistent database
var mongo_config = require("./Config.js").mongo_config;
if (mongo_config.enable){
  mongoose.connect(mongo_config.location);
}

var logstash = require("./Config.js").logstash;

if (logstash.enable){
	winston.add(winston.transports.Logstash, {
	    port: logstash.port,
	    label : require("./Config.js").service_name ,
	    host: logstash.ip,
	    handleExceptions: true,
	    humanReadableUnhandledException: true
	})
}

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

//init message_queue
require('./message_queue.js').init();

//MIDDLEWARE DECLARE
require('./middleware.js')(app, router, redis_client);

require('./route.js')(app, router)

// REGISTER OUR ROUTES ---------------------
app.use("/"+require("./Config.js").service_name, router);

// START THE SERVER
// =============================================================================
process.stdout.write("Try port: ");
var port  = process.argv[2] || config.port;
var tester = createServer(port);
function createServer(port){
	process.stdout.write(port + " ");
	var tester = app.listen(port)
	.once('error', function (err) {
		if (err.code == 'EADDRINUSE')
			createServer(++port);
	})
	.once('listening', function() {
		process.stdout.write("\n\tStart listening " + port + " ... \n");
		setTimeout(function(){
			require("./Config.js").setRESTPort(port);
			require("./zookeeper.js").register();
		},1000);
	});
}
