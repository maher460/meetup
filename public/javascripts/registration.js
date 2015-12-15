
$(function() {

	$("#signup_button").click(function(){
	     $.ajax({
	        url: '/newUser/' + $("#signup_username").val() + '/' + $("#signup_password").val() + '/' + $("#signup_displayName").val(),
	        type: 'PUT',
	        success: function(result) {
	        	console.log("CLIENT SIDE success! \n");
	        	console.log(result);
	        	if(result == "Create unsuccessful"){
	        		document.location.href = "/registration.html"
	        	}
	        	else{
	        		console.log("IN ELSE!");
	        		document.location.href = "/login.html"
	        	}
	            
	          }
	        });
	     });

	$("#group_submit2").click(function(){
	     document.location.href = "/group/" + $('#group_id').val();
	 });
});