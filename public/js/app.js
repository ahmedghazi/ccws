(function( $ ) {
	'use strict';

	init();

	function init(){
		loader_mouse();
		setTimeout(function(){
			$("body").removeClass("loading");
		}, 1000);
	}

	function loader_mouse(){
		var bsDiv = document.getElementById("loader");
        var x, y;
// On mousemove use event.clientX and event.clientY to set the location of the div to the location of the cursor:
        window.addEventListener('mousemove', function(event){
        	if(!document.body.classList.contains('loading'))return;
            x = event.clientX;
            y = event.clientY;                    
            if ( typeof x !== 'undefined' ){
                bsDiv.style.left = x + "px";
                bsDiv.style.top = y + "px";
            }
        }, false);
	}

	function count_click(){

	}


})( jQuery );
//var console = { log: function() {} };