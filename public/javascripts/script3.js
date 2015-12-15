$(function() {

	console.log(document.location.href);

	var url = document.location.href

	var group_key = url.split('/').pop();

	console.log(group_key);

	console.log($('#vote').val());


	$(".vote").click(function(){

		console.log($(this).val());

		var place_id = $(this).val();

	     $.post("/votePlace/" + group_key + '/' + place_id,
	        function(data){
	            console.log(data);
	            
	        });
	 });

	//window.setTimeout(function(){ document.location.reload(true); }, 10000);

	var placesUpdate = function(){
		$.ajax({
	        url: '/placesUpdate/' + group_key,
	        type: 'GET',
	        success: function(result) {
	        	//console.log(result);

	        	if(result == "Redirect to Progress"){
	        		
	        		window.setTimeout(function(){ document.location.href = "/progress/" + group_key; }, 5000);
	        	}

	        	$('#not_voted_members').text("");
	        	result = JSON.parse(result);
	        	// for(var i=0; i < result.length; i++){
	        	// 	$('#not_voted_members').append(result[i] + " ");
	        	// }

	        	$.each(result, function( index, value ) {
		           $("#not_voted_members").append("<center><div class='large-8 small-centered panel callout radius text-center'><h3>" + value + "</h3></div></center>");
		         });

	          }
	        });

		window.setTimeout(placesUpdate, 5000);
	}

	placesUpdate();

});