var smoothState = (function () {
 
    init()

    function init() {
        var options = {
            //anchors: "header a",
            //blacklist: '.sub-menu a, .projet-more',
            prefetch: true,
            cacheLength: 2,
            onStart: {
                duration: 250, // Duration of our animation
                render: function ($container) {
                    // Add your CSS animation reversing class
                    $container.addClass('is-exiting');
                    console.log("onStart")
                    // Restart your animation
                    //smoothState.restartCSSAnimations();
                }
            },
            onReady: {
                duration: 500,
                render: function ($container, $newContent) {
                    // Remove your CSS animation reversing class
                   
                    // Inject the new content
                    $container.html($newContent);
                    setTimeout(function(){
                        //$("body").attr('class', $("[name=bc]").val())
                        console.log("onReady")
                        pubsub.emit("navChanged", null);
                        if($(".item") && $(".item").length - 30)$(".more").hide()
                        $container.removeClass('is-exiting');
                    }, 100);
                    
                }
            }
        };
console.log(options)
        smoothState = $('#page').smoothState(options).data('smoothState');
        //console.log(smoothState)
        
        $(document).on('mousemove', "#page.is-exiting", function(e){
            $('#loader').css({
               left:  e.pageX - 125,
               top:   e.pageY - 125
            });
        });
    }

})();