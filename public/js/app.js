(function( $ ) {
	'use strict';
	var loading = false;
	init();

	function init(){
		infinite();
		count_click();
	}

	function infinite(){
		var threshold = 200;
		$(window).scroll(function() {		
			console.log($(window).scrollTop() + $(window).height() + threshold, $(document).height())
		   	if(($(window).scrollTop() + $(window).height() + threshold) > $(document).height()) {
		    	if(!loading)$(".more").click();
		   	}
		 });	

		$("html").on('click', '.more', function(event) {
			event.preventDefault();
			
			$("body").addClass("loading");
			loading = true;

			var path = window.location.origin
			//var st = $(this).parent().offset().top;
			
			var page = $("#page").val();
				page++;
			$("#page").val(page);

			var u = path+'/page/'+page;

			$.ajax({
				type: "GET",
				url: u
			})
				.done(function( html ) {
					//console.log(html);
					$("ul").append(html);

					$("body").removeClass("loading");
					loading = false;
					/*$("html,body").animate({
						scrollTop: st
					}, 1000)
	*/					
				});
		});
	}

	function count_click(){

	}


})( jQuery );
