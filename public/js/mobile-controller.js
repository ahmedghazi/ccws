var mobileController = (function () {
    
    init()
    
    function init() {
        bind_events()
    }

    function bind_events() {
        $("html").on("click", ".burger", function(){
            console.log("burger")
            $(this).toggleClass("is-active")
            if($(this).hasClass("is-active")){
                $(".nav").show();
                $("header").addClass("is-active")
            }else{
                $(".nav").hide();
                $("header").removeClass("is-active")
            }

        });

        $(".touchevents nav a").on("click", function(){
            $(".burger").click();
        });
    
    }

})();