var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    async = require('async'),
    Options = mongoose.model('Options'),
    Post = mongoose.model('Post'),
    request = require('request'),
    fs = require("fs"),
    //extract = require('meta-extractor'),
    webshot = require('node-webshot'),
    slug = require('slug'),
    moment = require('moment'),
    FB = require('fb'),
    color = require('dominant-color'),
    fbApp,
    client_id,
    client_secret,
    root_url;


exports.test = function(next) {
    return next("helpers");
};

exports.set_root_url = function(url) {
    root_url = url;
};

exports.init_fb = function() {
    client_id = '398286323958628';
    client_secret = '926f16496c7e71988cd8a827c9ea0ba0';
    fbApp = FB.extend({
        appId: client_id,
        appSecret: client_secret
    });
};

exports.set_total = function() {
    var self = this;
    Post
        .find()
        .exec(function(err, posts) {
            self.updateOptions("total_posts", posts.length, function(err, resp) {
                console.log(posts.length)
            });
        });
};

exports.init_timestamp = function(callback) {
    var self = this;

    Post
        .find()
        .limit(5)
        .sort({
            "updated_time": -1
        })
        //.limit(postsPerPage)
        .exec(function(err, posts) {
            if (err) {
                console.log(err);
                return next(err);
            }
            var last = posts[0];
            if (posts.length == 0) {
                var unix = "1513728000";
            } else {
                var time = new Date(last.updated_time);
                var unix = Math.round(time / 1000)
            }

            //return res.json(unix)
            self.updateOptions("last_post_timestamp", unix, function(____err, resp) {
                callback(unix)
            });
        });


};


exports.collect = function(min, callback) {
    var self = this;
    console.log("=========================")
    console.log("collect start")
    /*var d = new Date();
        d.setHours(0,0,0,0);
    var max = Math.round(d/1000);*/
    console.log("min: ", min)

    FB.setAccessToken('398286323958628|IrwxIREQmoqa0x8G2zTIj7AmzP8');
    FB.api('393558204075688/feed?limit=10&&fields=id,message,name,caption,description,updated_time,link,from,type', function(_res) {
        if (!_res || _res.error) {
            console.log(!_res ? 'error occurred' : _res.error);
            //return res.send(_res.error);
        }

        self.record(min, _res);
    });
};

exports.record = function(min, _res) {
    var self = this;
    if (!_res || _res.error) {
        console.log(!_res ? 'error occurred' : _res.error);
        return res.send(_res.error);
    }

    console.log("length", _res.data.length)

    async.each(_res.data,
        function(_post, callback) {
            if (_post.link) {

                //console.log("post updated_time : "+ _post.updated_time)
                console.log(min, Math.round(+new Date(_post.updated_time) / 1000))
                if (min > Math.round(+new Date(_post.updated_time) / 1000)) {
                    _res.paging = null;
                    callback();
                } else {
                    var query = {
                        link: _post.link
                    }
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

                    Post.findOneAndUpdate(query, update, {
                        upsert: true,
                        'new': true
                    }, function(err, post, raw) {
                        var _slug = "";
                        if (post.name)
                            _slug = slug(post.name).toLowerCase();
                        else
                            _slug = Math.random().toString(36).substring(7);

                        var screenshot = "public/uploads/crazy-cool-websites-" + _slug + ".png";
                        webshot(post.link, screenshot, {
                            renderDelay: 2000
                        }, function(error) {
                            if (!error) {
                                self.get_color(screenshot, function(color) {
                                    console.log("- screenshot", screenshot);
                                    console.log("- color", color);

                                    screenshot = screenshot.replace("public/", "");
                                    var query = {
                                        _id: post._id
                                    }
                                    var update = {
                                        image: screenshot,
                                        color: color
                                    }

                                    Post.findOneAndUpdate(query, update, {
                                        upsert: true,
                                        'new': true
                                    }, function(err, post, raw) {
                                        callback();
                                    });
                                });

                            } else {
                                console.log(error)
                                callback();
                            }
                        });
                    });
                }

            } else {
                callback();
            }
        },
        function(err) {

            if (_res.paging && _res.paging.next != "undefined") {
                var options = {
                    method: 'GET',
                    url: _res.paging.next,
                };

                request(options, function(error, response, body) {
                    if (error) throw new Error(error);

                    console.log("statusCode", response.statusCode);
                    //console.log(body);

                    self.record(min, JSON.parse(body))
                }).setMaxListeners(0);
            } else {
                console.log("record done, paging empty")
                self.set_total();
            }
        }
    );
};

exports.updateOptions = function(key, value, callback) {
    Options.findOneAndUpdate({
            'meta.key': key
        }, {
            'meta.value': value
        }, {
            upsert: true,
            'new': false
        },
        function(err, options, raw) {
            if (err) {
                return console.log(err);
            }

            callback(err, {
                success: true
            });
        });
};

exports.get_color = function(image, callback) {
    //if (image.indexOf("public") == -1) image = "public/" + image;
    console.log("get_color image",image)
    fs.readFile(image, function(err, data) {
        if (err) {
            callback("");
            //throw err; // Fail if the file can't be read.
        }
        //console.log(data)
        if (data == undefined) {
            callback("");
        }else{
            //console.log("get_color data",data)
            request.post('http://pictaculous.com/api/1.0/', {formData:{image:data}}, function optionalCallback(err, httpResponse, body) {
                if (err) {
                    return console.error('color failed:', err);
                }
                console.log('pictaculous successful!  Server responded');
                var palette = JSON.parse(body);
                //console.log(palette)
                var dominante = "";
                if (palette.info) {
                    if (palette.info.colors && palette.info.colors.length) {
                        if (palette.info.colors.length == 1) {
                            dominante = palette.info.colors[0]
                        } else if (palette.info.colors.length > 1) {
                            dominante = palette.info.colors[palette.info.colors.length - 2]
                        }
                    }
                } else {
                    console.log(palette.info)
                }

                callback(dominante);
            });
        }
        
       
    });
};