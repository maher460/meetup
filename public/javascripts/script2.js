$(function() {

	console.log(document.location.href);

	var url = document.location.href

	var group_key = url.split('/').pop();

	var longitude;
	var latitude;

	console.log(group_key);

	//var x = document.getElementById("demo");

	//function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getPosition);
    } else {
        alert("You need location activated for this app to work!");
    }
	//}

	function getPosition(position) {
	    latitude = position.coords.latitude; 
	    longitude = position.coords.longitude; 

	    console.log(latitude);
		console.log(longitude);

		addMember(group_key, latitude, longitude);


	}

	function addMember(group_key, latitude, longitude) {

		$.ajax({
	        url: '/addMember/' + group_key + '/' + latitude + '/' + longitude,
	        type: 'PUT',
	        success: function(result) {
	        	console.log(result);
	            
	          }
	        });

	}

	$("#group_complete_button").click(function(){

	     $.post("/completeGroup/" + group_key,
	        function(data){
	            console.log(data);
	            if(data=="DONE WITH ADDING PLACES!"){
	            	document.location.href = "/places/" + group_key;
	            }
	        });
	 });

	var groupUpdate = function(){
		$.ajax({
	        url: '/groupUpdate/' + group_key,
	        type: 'GET',
	        success: function(result) {
	        	//console.log(result);

	        	if(result == "Redirect to Places"){	

	        		window.setTimeout(function(){ document.location.href = "/places/" + group_key; }, 5000);
	        	}

	        	$('#current_members').text("");
	        	result = JSON.parse(result);
	        	// for(var i=0; i < result.length; i++){
	        	// 	$('#current_members').append(result[i] + " ");
	        	// }
	        	$.each(result, function( index, value ) {
		           $("#current_members").append("<center><div class='large-8 small-centered panel callout radius text-center'><h3>" + value + "</h3></div></center>");
		         });	
	          }
	        });

		window.setTimeout(groupUpdate, 5000);
	}

	groupUpdate();

	

});