var zookeeper = require('node-zookeeper-client');
var zk_client = zookeeper.createClient('127.0.0.1:2181');
var config = require("./config.js");
var async = require('async');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var util = require('util');

var Zookeeper = function(){
	this.isInit = false;
}

Zookeeper.prototype.register = function(){
	if (!this.isInit) {
		zk_client.connect();
		this.isInit = true;
	}
}

Zookeeper.prototype.watchExist= function(path, callback){
	zk_client.exists(path, callback ,function (error, stat) {
	});
}


zk_client.once('connected', function () {
	var mode = config.mode;
	var service_name = config.service_name;
	var service_usage = config.service_usage;
	var ip = config.ip;
	var path = "/pokemonhub/"+ mode;

	zk_client.create(path,new Buffer(""), function (error, path) {
        if (error && error.code!=-110) {
            console.log('Failed to create node: %s due to: %s.', path, error.code);
        	process.exit();
        }

        var path = "/pokemonhub/"+ mode + "/" +service_name;
        zk_client.create(path,new Buffer(""), function (error) {
	        if (error && error.code!=-110) {
	            console.log('Failed to create node: %s due to: %s. If node is exist ple', path, error);
	        	process.exit();
	        }

    		if (!ip)
		    	ip = require('./app/logics/libs/Common.js').getIP();

		    var data  = "";

		    if (config.rest_port != 0)
		    	data += ip+":"+config.rest_port;

		    var path = "/pokemonhub/"+ mode+"/"+service_name+"/process_";

		    zk_client.create(path,new Buffer(data.trim()), zookeeper.CreateMode.EPHEMERAL_SEQUENTIAL, function (error, path) {
		        if (error) {
		            console.log('Failed to create node: %s due to: %s. If node is exist ple', path, error);
		            process.exit();
		        } else {
		        	config.setSelfPath(path);
		        	eventEmitter.emit("zk_created");
		        }

		    });
		});
    });
});



function update_child(path, service, callback, time){
	time++;
	zk_client.getChildren(path, function (){
			update_child(path,service,callback,time);
		},function (error, children, stats) {
	    if (error) {
	        console.log("Service not found " + path);
	        zk_client.getChildren("/pokemonhub/"+ mode  , function (error, children, stats) {
			    console.log('Current service usage: %j', children);
			    process.exit();
			});
	    } else {
	    	var service_data = [];
	    	async.each(children,
	    		function(aProc, subcallback){
	    			zk_client.getData(path+"/"+aProc, function (error, data, stats) {
	    				if (!error){
	    					service_data.push(data.toString('utf8'));
	    				} else {
	    					console.log(error);
	    				}
	    				subcallback();
	    			});
	    		},
	    		function(err){
	    			config.setService(service, service_data);
	    			if (time==1)
	    				callback();
	    		}
	    	);

	    }
	});
}


eventEmitter.on("zk_created", function(){
	var service_arr = [];

	for (var key in config.service_usage){
		service_arr.push(key);
	}

	var mode = config.mode;

	async.each(service_arr,
		function(service, callback){
			var path = "/pokemonhub/"+ mode + "/" + service;
			update_child(path,service,callback,0);
		},
		function(err){
			console.log("Init service info successfully");
			console.log(config.service_path);
			console.log(config.service_usage);
		}
	);
});



exports = module.exports = new Zookeeper();
