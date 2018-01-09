var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    request = require('request'),
    schedule = require('node-schedule'),
    helpers = require('./helpers');


exports.test = function(next){
    return next("cron");
};

exports.cronStop = function(next){
    var stop = schedule.cancelJob("ccws-cron")
    return next(false, stop);
};

exports.cronStart = function(app, next){
    var rule = new schedule.RecurrenceRule();
    //rule.dayOfWeek = [1, 2, 3, 4, 5];
    //rule.dayOfWeek = "*";
    //rule.hour = "*";
    rule.minute = "10";
    //rule.minute = "17";
    //rule.second = "50";
console.log('cronStart', new Date());

    schedule.scheduleJob("ccws-cron", rule, function(){
        console.log('--------honor-cron', new Date());
        
        helpers.set_root_url(app.locals.root_url)

        helpers.init_timestamp(function(time){
            helpers.collect(time, function(){
                console.log("collect callback")
            });
        });
        
    });
};


