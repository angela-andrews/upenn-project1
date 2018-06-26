var subBtn = $("button[type='submit']");
var input = $("#search-input");

subBtn.on("click", function(event){
    event.preventDefault();
    var keyword = '&query=' + input.val();
    console.log("seb event");
    $.ajax({
        url:'https://api.foursquare.com/v2/venues/search?limit=5&client_id=FKPJMRN1PCLMFIO32S4QKWS4MV5X0Y1JAKZYOGRP0I4BMVW1&client_secret=BPRZ4NPXWKPRJVCPA3LWZXC5C0A1J5FNNMNKIMNON0CSGTEA&v=20130815&near=Philadelphia&query=' + keyword,
        dataType: 'json',
        
}).then(function(response){
    console.log(response);
    var venArray = response.response.venues;
    var venIdArray = [];
    console.log(venArray[1].id);

    for(var i=0; i<venArray.length; i++){
        var venId = venArray[i].id;
        venIdArray.push(venId);
    }
    console.log(venIdArray.length);

    for(var j = 0; j<venIdArray.length; j++){
        $.ajax({
            url:'https://api.foursquare.com/v2/venues/' + venIdArray[j] + '?&client_id=FKPJMRN1PCLMFIO32S4QKWS4MV5X0Y1JAKZYOGRP0I4BMVW1&client_secret=BPRZ4NPXWKPRJVCPA3LWZXC5C0A1J5FNNMNKIMNON0CSGTEA&v=20130815',
            dataType: 'json',
    }).then(function(response2){
        venDetails = response2.response.venue;
        console.log(venDetails);
        for(var k=0; k<response2.length; k++){
            var restyDiv = $("<div class='col-8 bg-warning d-flex>");
                restyDiv.addClass("id", venDetails[k].id)
                var nameP = $("<p>").text(venDetails[k].name);
                var priceP = $("<p>").text(venDetails[k].price.message);
                var hoursP = ("<p>").text(venDetails[k].hours.status);
            
            restyDiv.append(nameP, priceP, hoursP);
            $("#results-col").append(restyDiv);
        }
    });
  }; 
  })
});