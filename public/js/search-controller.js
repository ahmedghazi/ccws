var navController = (function () {
    
    bind_events()
    
    function bind_events() {
        $("html").on("click", "a.no-smoothState", function(e){
            e.preventDefault();
            $("#search").removeClass("slideTop");
            setTimeout(function(){
                $("input[name='s']").focus();
            }, 400);
        });

        $("html").on("mouseenter", "a.no-smoothState", function(e){
            $("#search").removeClass("slideTop");
            setTimeout(function(){
                $("input[name='s']").focus();
            }, 400);
        });

        $("html").on("mouseleave", "header", function(e){
            $("#search").addClass("slideTop");
        });

        $(document).on( 'mousedown', '#s', function(e) {
            if(this.value == "SEARCH")this.value = "";
        });

        $(document).on( 'keyup', '#s', function(e) {
            e.stopPropagation();

            var value = this.value;

            if(this.value.length > 3){
                $("body").addClass("loading");
                $.ajax({
                  method: "GET",
                  url: '/s/'+value
                })
                .done(function( data ) {
                    $(".liste").html(data)
                    history.pushState({}, 'SEARCHING : '+value,'/search/'+value)
                    if(!data)get_page(document.title, "/")
                    $("body").removeClass("loading");
                });
            }
        });

    }

})();