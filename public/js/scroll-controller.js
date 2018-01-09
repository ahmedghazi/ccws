var scrollController = (function () {
    
    var loading = false;

    titles();
    infinite()
    
    function titles(){
        var max = $(".autoradio").width()
        $(".autoradio:not(.can) .name").each(function(idx, el){
            var w = $(el).width();
            console.log(w, max)
            if(w > max)$(el).parent().addClass("can");
        })
    }

    function infinite(){
        
        var threshold = 200;
        $(window).scroll(function() {       
            //console.log($(window).scrollTop() + $(window).height() + threshold, $(document).height())
            if(($(window).scrollTop() + $(window).height() + threshold) > $(document).height()) {
                if(!loading && $(".liste"))$(".more").click();
            }

            if($(window).scrollTop() > threshold){
                $("header").addClass("affix");
            }else{
                $("header").removeClass("affix");
            }
         });    

        $("html").on('click', '.more', function(event) {
            event.preventDefault();
            
            $("body").addClass("is-exiting");
            loading = true;

            //console.log(window.location)
            var path = window.location.origin
            if(window.location.href.indexOf("random") > -1)path = window.location.href;

            var page = $("#page").val();
                page++;
            $("#page").val(page);

            var u = path+'/page/'+page;

            $.ajax({
                type: "GET",
                url: u
            })
                .done(function( html ) {
                    $(".liste").append(html);

                    $("body").removeClass("is-exiting");
                    loading = false;
                    titles();
                });
        });
    }

})();