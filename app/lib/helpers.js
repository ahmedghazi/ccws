var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    async = require('async'),
    Options = mongoose.model('Options'),
    Post = mongoose.model('Post'),
    request = require('request'),
    //extract = require('meta-extractor'),
    webshot = require('node-webshot'),
    slug = require('slug'),
    moment = require('moment'),
    FB = require('fb'),
    fbApp,
    client_id,
    client_secret;


exports.test = function(next){
    return next("helpers");
};

exports.init_fb = function(){
    client_id = '398286323958628';
    client_secret = '926f16496c7e71988cd8a827c9ea0ba0';
    fbApp = FB.extend({appId: client_id, appSecret: client_secret});
};

exports.init_timestamp = function(){
    var d = new Date();
    //d.setHours ( d.getHours() - 3 );
    d.setHours(0,0,0,0);

    Options.findOneAndUpdate(
        {'meta.key': 'first_post_timestamp'}, 
        {'meta.value': Math.round(d/1000)}, 
        {upsert: true, 'new': false}, 
        function (err, options, raw) {
        if (err) {
            return console.log(err);
        } 

        //callback(err, {success:true});
    });
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
        
        //console.log(option)
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

            FB.setAccessToken('398286323958628|IrwxIREQmoqa0x8G2zTIj7AmzP8');
            FB.api('393558204075688/feed?limit=10&&fields=id,message,name,caption,description,updated_time,link,from,type', function (_res) {
                if(!_res || _res.error) {
                console.log(!_res ? 'error occurred' : _res.error);
               //return res.send(_res.error);
                }
              
                self.record(first_post_timestamp,_res);
            });
            

        }
    });
};

exports.record = function(first_post_timestamp, _res){
    var self = this;
    if(!_res || _res.error) {
        console.log(!_res ? 'error occurred' : _res.error);
        return res.send(_res.error);
    }

    console.log("length",_res.data.length)

    async.each(_res.data,
        function(_post, callback){
            if(_post.link){
                var query = {link: _post.link}
                var update = {
                    fbid: _post.id,
                    type: _post.type,
                    name: _post.name,
                    message: _post.message,
                    description: _post.description,
                    updated_time: _post.updated_time,
                    link: _post.link,
                    from: _post.from.name
                }
                //console.log("post updated_time : "+ _post.updated_time)
                console.log(first_post_timestamp, Math.round(+new Date(_post.updated_time)/1000))
                if(first_post_timestamp < Math.round(+new Date(_post.updated_time)/1000)){
                    _res.paging = null;
                    callback();
                }else{
                    Post.findOneAndUpdate(query, update, {upsert: true, 'new': true}, function (err, post, raw) {
                        var slug = "";
                        if(post.name)
                            slug = slug(post.name);
                        else 
                            slug = Math.random().toString(36).substring(7);
                        var screenshot = "public/uploads/ccws-"+slug+".png";
                        webshot(post.link, screenshot, function(error) {

                        //extract({ uri: post.link }, function (error, results) {
                            if(!error){       
                                var image = '';
                                if(results.ogImage)
                                    image = results.ogImage;
                                else if(results.twitterImage){
                                    image = results.twitterImage;
                                }

                                var query = {_id: post._id}
                                var update = {image: image}
                                console.log(image);
                                
                                Post.findOneAndUpdate(query, update, {upsert: true, 'new': true}, function (err, post, raw) {
                                    callback();
                                });

                            }else{
                                callback();
                            }
                        });
                    });
                }
             
            }else{
                callback();
            }
        },
        function(err){

            if (_res.paging && _res.paging.next != "undefined"){
                var options = { 
                    method: 'GET',
                    url: _res.paging.next,
                };

                request(options, function (error, response, body) {
                    if (error) throw new Error(error);

                    console.log("statusCode",response.statusCode);
                    //console.log(body);

                    self.record(first_post_timestamp, JSON.parse(body))
                }).setMaxListeners(0);
            }else{
                console.log("done")
            }
        }
    );
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


