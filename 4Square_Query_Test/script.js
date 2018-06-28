//////////////////FIREBASE SETUP/INIT//////////////////
var config = {
    apiKey: "AIzaSyAW7bA6l1SKh_5cY1QA6B762FDhcLsGgvE",
    authDomain: "q-test-app.firebaseapp.com",
    databaseURL: "https://q-test-app.firebaseio.com",
    projectId: "q-test-app",
    storageBucket: "",
    messagingSenderId: "660859232414"
  };
  firebase.initializeApp(config);

  //////////////////////////////////////////////////////

var database = firebase.database();
var subBtn = $("button[type='submit']");
var input = $("#search-input");

subBtn.on("click", function(event){
    event.preventDefault();
    var keyword = '&query=' + input.val();
    //first call asks API for a list of restuarants within given geoloc
    $.ajax({
        // url:'https://api.foursquare.com/v2/venues/search?limit=5&client_id=FKPJMRN1PCLMFIO32S4QKWS4MV5X0Y1JAKZYOGRP0I4BMVW1&client_secret=BPRZ4NPXWKPRJVCPA3LWZXC5C0A1J5FNNMNKIMNON0CSGTEA&v=20130815&near=Philadelphia' + keyword, //andrewdwilk
        // url:'https://api.foursquare.com/v2/venues/search?limit=5&client_id=4UJJFJRKUVNW1LRBLHWQSZHBUVWQMMH14O3H40RTTNAN5ZAQ&client_secret=AHIYIEJF1EZTPCNWQJ05HOYNZEUJCFNIK0TXE1DZEY4P2KE1&v=20130815&near=Philadelphia' + keyword, //pamrecnetwork
        // url:'https://api.foursquare.com/v2/venues/search?limit=5&client_id=K3TZ4RDWFM4WLDUREOH0VSA0BDCXO5TAYR0BPLEML535HC0M&client_secret=3PT4TSFEMQI0GOLNMP5QOTK1CSH24XQ1AVZUIATQ5QMNVH5B&v=20130815&near=Philadelphia' + keyword, //andrewwilk1990
        url:'https://api.foursquare.com/v2/venues/search?limit=5&client_id=GRFVBTPCJBJZVW43D2WN1VWP4VLXQO5I1E2S2PUPOHBT42VV&client_secret=VUAZUO4SHDGM1RWC32TWFWVINL4RDRD2GSEX5IUSZEUKYTB2&v=20130815&near=Philadelphia' + keyword, //
        
        dataType: 'json',
        
}).then(function(response){
    console.log(response);
    //from list of venues, an array of their ids is made
    var venArray = response.response.venues;
    var venIdArray = [];
    console.log(venArray);

    for(var i=0; i<venArray.length; i++){
        var venId = venArray[i].id;
        venIdArray.push(venId);
    }
    console.log(venIdArray.length);
    //for each id in the venueid array, an ajax call is made for complete venue information, this info used to populate divs for each with venue-choice class connected to a click event
    for(var j = 0; j<venIdArray.length; j++){
        $.ajax({
            // url:'https://api.foursquare.com/v2/venues/' + venIdArray[j] + '?client_id=FKPJMRN1PCLMFIO32S4QKWS4MV5X0Y1JAKZYOGRP0I4BMVW1&client_secret=BPRZ4NPXWKPRJVCPA3LWZXC5C0A1J5FNNMNKIMNON0CSGTEA&v=20130815', //andrewdwilk
            // url:'https://api.foursquare.com/v2/venues/' + venIdArray[j] + '?client_id=4UJJFJRKUVNW1LRBLHWQSZHBUVWQMMH14O3H40RTTNAN5ZAQ&client_secret=AHIYIEJF1EZTPCNWQJ05HOYNZEUJCFNIK0TXE1DZEY4P2KE1&v=20130815', //pamrecnetwork
            // url:'https://api.foursquare.com/v2/venues/' + venIdArray[j] + '?client_id=K3TZ4RDWFM4WLDUREOH0VSA0BDCXO5TAYR0BPLEML535HC0M&client_secret=3PT4TSFEMQI0GOLNMP5QOTK1CSH24XQ1AVZUIATQ5QMNVH5B&v=20130815&', //andrewwilk1990
            url:'https://api.foursquare.com/v2/venues/' + venIdArray[j] + '?client_id=GRFVBTPCJBJZVW43D2WN1VWP4VLXQO5I1E2S2PUPOHBT42VV&client_secret=VUAZUO4SHDGM1RWC32TWFWVINL4RDRD2GSEX5IUSZEUKYTB2&v=20130815&', //
           
            dataType: 'json',
    }).then(function(response2){
        venDetails = response2.response.venue;
        console.log(venDetails);
        console.log(venDetails.location.address);

            var restyDiv = $("<div class='col-4 m-4 mx-auto bg-warning justify-content-center p-2 d-flex venue-choice'>");
                restyDiv.attr("id", venDetails.id)
                    ///in addition to the 4SQid being made id for the restaurant bar, other information stored as attribute values so when repopulated elsewhere further AJAX calls are unnecessary
                        restyDiv.attr("square-url",venDetails.shortUrl)
                        restyDiv.attr("venue-name", venDetails.name);
                        restyDiv.attr("venue-price", venDetails.price.message);
                        restyDiv.attr("venue-loc", venDetails.location.address);

                var nameP = $("<p>").text(venDetails.name);
                var priceP = $("<p class='ml-3'>").text(venDetails.price.message);
                var locP = $("<p class='ml-3'>").text(venDetails.location.address);
            
            restyDiv.append(nameP, priceP, locP);
            $("#results-col").append(restyDiv);
        
    });
  }; 
  });
});

$(document).on("click", ".venue-choice", function(){
    console.log("click");
    var selected = $(this).attr("id");
    var nameSelected = $(this).attr('venue-name');    
    var priceSelected = $(this).attr('venue-price');
    var locSelected = $(this).attr('venue-loc');
    var squareUrl = $(this).attr('square-url');

    database.ref('nominations').push({
        id: selected,
        name: nameSelected,
        price: priceSelected,
        location: locSelected,
        url: squareUrl
    });




});

database.ref('nominations').on("child_added", function(snapshot) {
    var sv = snapshot.val();
    console.log(sv);

    var nomDiv = $("<div class='col m-4 mx-auto bg-warning text-center p-2 clear-fix nomination'>");
        nomDiv.attr("id", sv.id);
        nomDiv.attr("url", sv.url);
    var nameP = $("<p>").text(sv.name);
    var priceP = $("<p class='ml-3'>").text(sv.price);
    var locP = $("<p class='ml-3'>").text(sv.location);

    nomDiv.append(nameP, priceP, locP);
    $("#nom-col").append(nomDiv);
});
