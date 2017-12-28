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
    var stop = schedule.cancelJob("honor-cron-1")
    return next(false, stop);
};

exports.cronStart = function(app, next){
    var rule = new schedule.RecurrenceRule();
    //rule.dayOfWeek = [1, 2, 3, 4, 5];
    //rule.dayOfWeek = "*";
    //rule.hour = "*";
    rule.minute = "10";
    //rule.minute = "17";
    //rule.second = "20";

    schedule.scheduleJob("honor-cron-1", rule, function(){
        console.log('--------honor-cron', new Date());

        var d = new Date();
        d.setHours ( d.getHours() - 3 );
        var max = Math.round(d/1000);

        helpers.collect(max, function(){
            console.log("collect callback")
        });

        
    });
};


