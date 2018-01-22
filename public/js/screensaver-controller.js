var screensaverController = (function () {
    
    var delay = 10000;

    //init()
    
    function init() {
        //$("#screensaver").hide();
        bind_events()
        delay_show();
    }

    function bind_events() {
        pubsub.on("changing", function(){
            delay_show();
        });

        window.addEventListener('mousemove', function(event){
            delay_show();
        });

        window.onblur = function() {
            console.log("onblur")
            delay_show();
        };
    }

    function delay_show(){
        $("#screensaver").hide();

        clearTimeout($.data(self, 'screensaverTimer'));
        $.data(self, 'screensaverTimer', setTimeout(function() {
            $("#screensaver").show();
        }, delay));
    }

})();