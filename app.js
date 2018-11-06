

var express = require('express'),
  config = require('./config/config'),
  glob = require('glob');
const mongoose = require('mongoose');
  mongoose.Promise = global.Promise;

mongoose.connect(config.db, { useMongoClient: true });
var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + config.db);
});

var models = glob.sync(config.root + '/app/models/*.js');
models.forEach(function (model) {
  require(model);
});
var app = express();

app.use(function(req, res, next){
	req.resetDb = function(){
	  mongoose.connection.db.dropDatabase();
	}
	return next();
})

module.exports = require('./config/express')(app, config);

app.listen(config.port, function () {
  console.log('Express server listening on port ' + config.port);
});

