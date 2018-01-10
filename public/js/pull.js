var pull = (function () {
    var c = 0;
    init()

    function init() {
        $("#pull").on("click", function(){
            
            $.ajax({
              method: "GET",
              url: '/api/all'
            })
            .done(function( data ) {
                console.log(data)
                pull(data);
                for(var i in data[i]){

                }
            });
        })
    }

    function pull(data) {
        var id = data[c]._id;
        $.ajax({
          method: "GET",
          url: '/api/media/'+id
        })
        .done(function( res ) {
            console.log(res)
            c++;
            if(c < data.length){
                pull(data);
                var html = $("#result").html();
                if(res)html += "<div>"+c+" : "+res.name+" : "+res.image+" - "+res.color+"</div>";
                if(res)$("#result").html(html)
            }else{
                var html = $("#result").html();
                html += "<div>done !!</div>";
                $("#result").html(html)
                console.log("done");
            }
        });
        
    }

})();