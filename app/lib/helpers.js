var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    async = require('async'),
    Options = mongoose.model('Options'),
    moment = require('moment');


exports.test = function(next){
    return next("helpers");
};

exports.tst = function(callback){
    //console.log(self)
    console.log(this)
    //this.tst(callback)
};


exports.collect = function(max, callback){
    var self = this;
    console.log("=========================")
    console.log("collect start")
    /*var d = new Date();
        d.setHours(0,0,0,0);
    var max = Math.round(d/1000);*/
    console.log("max: ",max)

    Options
        .findOne({ 'meta.key': 'first_post_timestamp' })
        .exec(function(err, option) {
        if (err) return handleError(err);

        first_post_timestamp = option.meta.value;
        if(!first_post_timestamp)first_post_timestamp = Math.round(+new Date()/1000);

        console.log("db - first_post_timestamp: ",first_post_timestamp)

        if(first_post_timestamp < max){
            console.log("first_post_timestamp < max")
            self.updateOptions("first_post_timestamp", "", function(____err,resp){
                //return res.redirect('/api/feed/media/all');
                console.log("collect end, max reached")
                console.log("=========================")
                callback();
            });
        }else{

            socialFeed.fetchByTimeStamp(first_post_timestamp, "until", function(err,result){
                if (err) {
                    return res.send(err);
                }
                console.log("api - first_post_timestamp:", result.body.page.first_post_timestamp)

                if(result.body.page.first_post_timestamp){
                    async.each(result.body.posts, function(post, callback2){
                        if(post.media_url == null){
                            callback2();
                        }else{
                          
                            processPostInsertScanUpdate(post, function(result){
                                callback2();
                            })  
                        }

                    }, function(__err){

                        self.updateOptions("first_post_timestamp", result.body.page.first_post_timestamp, function(____err,resp){
                            console.log("collect next page")
                            //res.redirect('/api/feed/insert-24');
                            self.collect(max, callback)
                        })
                       
                    });
                    
                }else{
                    //console.log(result)
                    self.updateOptions("first_post_timestamp", "", function(____err,resp){
                        //return res.redirect('/admin');
                        console.log("no more results")
                        callback();
                    });
                }
                
            })

        }
    });
};

exports.updateOptions = function(key,value,callback){
    Options.findOneAndUpdate(
        {'meta.key': key}, 
        {'meta.value': value}, 
        {upsert: true, 'new': false}, 
        function (err, options, raw) {
        if (err) {
            return console.log(err);
        } 

        callback(err, {success:true});
    });
};


