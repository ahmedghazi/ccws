(function( $ ) {
	'use strict';
	var x, y,bsDiv;
	init();

	function init(){
		//loader_mouse();
		setTimeout(function(){
			$("body").removeClass("loading");
		}, 1000);
	}

	function loader_mouse(){
		bsDiv = document.getElementById("loader");

		pubsub.on("navChanged", function(){
			place_loader()
		});
		
        /*
        window.addEventListener('mousemove', function(event){
            x = event.clientX;
            y = event.clientY;     
            //if(!document.body.classList.contains('loading'))return;

            place_loader()
        }, false);
        */
	}

	function place_loader(){
		if ( typeof x !== 'undefined' ){
		    bsDiv.style.left = x + "px";
		    bsDiv.style.top = y + "px";
		}
	}

	function count_click(){

	}


})( jQuery );
//var console = { log: function() {} };