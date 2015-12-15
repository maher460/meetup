$( document ).ready(function() {

	$("#group_submit").click(function(){
	     $.ajax({
	        url: '/newGroup/' + $("#group_name").val(),
	        type: 'PUT',
	        success: function(result) {
	        	console.log("CLIENT SIDE success! \n");
	        	console.log(result);
	        	if(result == "Create unsuccessful"){
	        		document.location.href = "/"
	        	}
	        	else if(result == "Authentication Failed"){
	        		document.location.href = "/login.html"
	        	}
	        	else{
	        		console.log("IN ELSE!");
	        		document.location.href = "/group/" + result;
	        	}
	            
	          }
	        });
	     });

	$("#group_submit2").click(function(){
	     document.location.href = "/group/" + $('#group_id').val();
	 });

});