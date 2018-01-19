var navController = (function () {
    
    bind_events()
    
    function bind_events() {
        /*$(document).on( 'click', 'h1 a', function(e) {
            e.preventDefault();
            get_page(document.title, '/');
        });*/

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

        /*$(document).on( 'click', '#random', function(e) {
            get_page("RANDOM", "/random")
            
        });*/

        /*$(document).on( 'click', '#contributors-toggle', function(e) {
            $(this).toggleClass("active");
            $(".from").toggle()
        });*/

    }

    function get_page(title, url){
        $("body").addClass("loading");
        
        $.ajax({
          method: "GET",
          url: url
        })
        .done(function( data ) { 
            console.log($("section", data).html())
            $('section').html($("section", data).html());
            //$(".liste").html(data)
            history.pushState({}, title, url)
            $('#s').val("SEARCH")
            $("body").removeClass("loading");
        });
    }

})();