var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'),
    Post = mongoose.model('Post'),
    request = require('request'),
    //fs = require("fs"),
    async = require('async'),
    extract = require('meta-extractor'),
    helpers = require('../lib/helpers'),
    webshot = require('node-webshot'),
    slug = require('slug'),
    FB = require('fb'),
    color = require('dominant-color'),
    fbApp,
    client_id,
    client_secret,
    app;

module.exports = function(_app) {
    client_id = '398286323958628';
    client_secret = '926f16496c7e71988cd8a827c9ea0ba0';
    fbApp = FB.extend({
        appId: client_id,
        appSecret: client_secret
    });

    app = _app;
    app.use('/api', router);
};

router.get('/', function(req, res, next) {
    res.send("api")
});

router.get('/oauth', function(req, res, next) {
    FB.api('oauth/access_token', {
        client_id: client_id,
        client_secret: client_secret,
        grant_type: 'client_credentials'
    }, function(_res) {
        if (!_res || _res.error) {
            console.log(!_res ? 'error occurred' : _res.error);
            return;
        }

        var accessToken = _res.access_token;
        console.log(accessToken)
        //398286323958628|IrwxIREQmoqa0x8G2zTIj7AmzP8
        return res.send(accessToken)
    });
});



router.get('/last', function(req, res, next) {
    Post
        .find()
        .limit(10)
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
            var time = new Date(last.updated_time);
            var unix = Math.round(time / 1000)
            //return res.json(unix)
            Options.findOneAndUpdate({
                    'meta.key': 'first_post_timestamp'
                }, {
                    'meta.value': unix
                }, {
                    upsert: true,
                    'new': false
                },
                function(err, options, raw) {
                    if (err) {
                        return console.log(err);
                    }

                    //callback(err, {success:true});
                });

        });

});

router.get('/posts', function(req, res, next) {
    helpers.set_root_url(app.locals.root_url)
    helpers.init_timestamp(function(time) {
        helpers.collect(time, function() {
            console.log("collect callback")
        });
    });
});

router.get('/count', function(req, res, next) {
    helpers.set_total();
});

router.get('/all', function (req, res, next) {
    return Post
        .find()
        .sort({updated_time: 'desc'})
        //.limit(postsPerPage)
        .exec(function(err, posts) {
            if (err) {
                console.log(err);
                return next(err);
            }
            //console.log(app.get('title'));
            return res.json(posts);
        });
});


router.get('/media', function(req, res, next) {
    Post
        .find()
        //.limit(2)
        .sort({
            updated_time: 'desc'
        })
        .exec(function(err, posts) {

            async.each(posts,
                function(post, callback) {
                    if (!post.image || post.image.indexOf("3005") == -1) {
                        console.log("has no image")
                        if (post.name)
                            _slug = slug(post.name).toLowerCase();
                        else
                            _slug = Math.random().toString(36).substring(7);
                        var screenshot = "uploads/crazy-cool-websites-" + _slug + ".png";
                        webshot(post.link, "public/" + screenshot, {
                            renderDelay: 2000
                        }, function(error) {
                            
                            helpers.get_color("public/" + screenshot, function(color) {
                                console.log("- screenshot", screenshot);
                                console.log("- color", color);

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
                                    callback()
                                });
                            });
                        });
                    }else{
                        console.log("has image", post.image)
                        helpers.get_color("public/" + post.image, function(color) {
                            console.log("- screenshot", post.image);
                            console.log("- color", color);

                            var query = {
                                _id: post._id
                            }
                            var update = {
                                color: color
                            }

                            Post.findOneAndUpdate(query, update, {
                                upsert: true,
                                'new': true
                            }, function(err, post, raw) {
                                callback()
                            });
                        });
                    }
                }, function (err) {
                    // result now equals 'done'
                    return res.send("done")
            });
            
        });
});



router.get('/media/:id', function(req, res, next) {
    Post
        .findOne({
            _id: req.params.id
        })
        .exec(function(err, post) {
            if (err) {
                console.log(err);
                return next(err);
            }

            if (!post)return res.json(post)
            if (post.color && post.color != "")return res.json(post);

            if (post.link.indexOf("facebook.com") > -1)return res.json(post)
            if (post.link.indexOf("gradient.world") > -1)return res.json(post)
            if (post.link.indexOf("modem.studio") > -1)return res.json(post)
            if (post.name == "img.modem.studio")return res.json(post)
            /*if (post.link.indexOf("eidos.digital") > -1)return res.json(post)
            if (post.link.indexOf("panterosmediagalaxy.eu") > -1)return res.json(post)
            if (post.link.indexOf("arket.com") > -1)return res.json(post)*/
            //if (post.link.indexOf("tig.ht") > -1)return res.json(post)
            //if (post.link.indexOf("https") > -1)return res.json(post)

            //if (post.name == "tig.ht")return res.json(post)
            

            helpers.get_screenshot(post, function(screenshot) {
                if(!screenshot || screenshot == "") return res.json(post)

                helpers.get_color("public/" + screenshot, function(color) {
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
                        return res.json(post)
                    });
                });
            });
        });

});

router.get('/t', function(req, res, next) {
    Post
        .find()
        //.limit(5)
        .sort({
            updated_time: 'desc'
        })
        .exec(function(err, posts) {
            var file = posts[0].image
            console.log(file )
    /*var file = 'public/uploads/crazy-cool-websites-dj-marcelleanother-nice-mess.png';
    var url = app.locals.root_url + '/' + file;

    helpers.get_color(file, function(color) {
        return res.send(color)
    })*/

            helpers.get_color("public/"+file, function(color) {
                return res.send(color)
            })

        });

});

router.get('/drop', function(req, res, next) {
    req.resetDb();
    res.redirect("/api");
    //res.send("done")
});

/*
mongodump --db sniff-development
mongorestore --db sniff-development ./sniff-development
*/