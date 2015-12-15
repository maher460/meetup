$( document ).ready(function() {
    $("#step1_button").click(function(event) {

      /* stop form from submitting normally */
      event.preventDefault();

      /* get some values from elements on the page: */
      var $form = $("#step1");
      var url = $form.attr( 'action' );

      /* Send the data using post */
      var posting = $.get( url, { plan_key: $('#plan_key').val() } );

      /* Alerts the results */
      posting.done(function( data ) {
        alert(data);
      });
    });

/* attach a submit handler to the form */
    $("#step2_button").click(function(event) {

      /* stop form from submitting normally */
      event.preventDefault();

      /* get some values from elements on the page: */
      var $form = $("#step2");
      var url = $form.attr( 'action' );
      
      var temp2 = [];

      /* Send the data using post */
      var posting = $.get( url, { budget: $('#budget').val(), start_date: $('#dpd1').val(), end_date: $("#dpd2").val(), source: $("#origin").val() } );

      /* Alerts the results */
      posting.done(function( data ) {
        console.log(data);
        
        $.each(data, function( index, value ) {
          var temp = $( "<input id='checkbox"+ index +"'class='r_cities' type='checkbox' value='"+ value +"'><label for='checkbox"+ index +"'>"+ value +"</label>" );
          $("#cities_div").append(temp);
        });
        
      });
    });
    
    $("#step3_button").click(function(event) {

      /* stop form from submitting normally */
      event.preventDefault();

      /* get some values from elements on the page: */
      var $form = $("#step3");
      var url = $form.attr( 'action' );
      
      var temp2 = [];
      $('.r_cities').each(function(index,data) {
           console.log($(this));
           if ($(this).is(':checked')) {
                temp2.push($(this).val());
            } 
        });
      if($("#r_cities_i").val()){
          temp2.push($("#r_cities_i").val());
      }
    console.log(temp2);

      /* Send the data using post */
      var posting = $.get( url, { budget: $('#budget').val(), start_date: $('#dpd1').val(), end_date: $("#dpd2").val(), source: $("#origin").val(), cities: JSON.stringify(temp2) } );

      /* Alerts the results */
      posting.done(function( data ) {
        console.log(data);
        
       $("#cities_div").html("");
       $("#r_cities_i").val("");
        
        $.each(data, function( index, value ) {
          var temp = $( "<input id='checkbox"+ index +"'class='r_cities' type='checkbox' value='"+ value +"'><label for='checkbox"+ index +"'>"+ value +"</label>" );
          $("#cities_div").append(temp);
        });
        
      });
    });
    
    $("#step4_button").click(function(event) {

      /* stop form from submitting normally */
      event.preventDefault();

      /* get some values from elements on the page: */

      var url = "/create_plan";
      
      var temp2 = [];
      $('.r_cities').each(function(index,data) {
           console.log($(this));
           if ($(this).is(':checked')) {
                temp2.push($(this).val());
            } 
        });
      if($("#r_cities_i").val()){
          temp2.push($("#r_cities_i").val());
      }
    console.log(temp2);

      /* Send the data using post */
      var posting = $.get( url, { plan_key: $('#plan_key').val(), budget: $('#budget').val(), start_date: $('#dpd1').val(), end_date: $("#dpd2").val(), source: $("#origin").val(), cities: JSON.stringify(temp2) } );

      /* Alerts the results */
      posting.done(function( data ) {
        console.log(data);
        
        alert("Success! Your plan hase been created! Keep the session key for your reference.");
        
      });
    });
    
    $("#step5_button").click(function(event) {

      /* stop form from submitting normally */
      event.preventDefault();

      /* get some values from elements on the page: */
      var url = "/compute_plan";

      /* Send the data using post */
      var posting = $.get( url, { plan_key: $('#plan_key').val() } );

      /* Alerts the results */
      posting.done(function( data ) {
        //alert(data);
        // console.log(data);
        // var arr = $.parseJSON(data);
        $("#result_complete").append("<h3> Destination: " + data['destination'] + "</h3>");
        
        $("#result_complete").append("<h4> Hotels: </h4>");
        
         $.each(data['hotels'], function( index, value ) {
           $("#result_complete").append("<p>" + value['name'] + ", " + value['rating'] + "</p>");
         });
        
      });
    });

    $.getJSON('https://freegeoip.net/json/') 
     .done (function(location)
     {
          $('#origin').val(location.city + ", " + location.region_code);
     });
});

