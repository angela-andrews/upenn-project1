//////////////////FIREBASE SETUP/INIT//////////////////
var config = {
    apiKey: "AIzaSyC6jLmPlZjP04JCO2LJGRwt_shJj4GWix4",
    authDomain: "eat-meet.firebaseapp.com",
    databaseURL: "https://eat-meet.firebaseio.com",
    projectId: "eat-meet",
    storageBucket: "eat-meet.appspot.com",
    messagingSenderId: "103168267880"
  };

  firebase.initializeApp(config);



  //////////////////////////////////////////////////////

    var database = firebase.database();
    var subBtn = $("#search-sub-btn");
    var input = $("#search-input");
    var voteCount = 3;
    var chosen = [];
    var item;
    var compiledArray = [];
    var sortedArray = [];
    var winner = "";
    var transformedWinner = "";
    var usersCurrent = 0;
    var clientId = localStorage.getItem("storedId");
    var clientSecret = localStorage.getItem("storedSecret");
    var completedArray = [];
    var nominationArray = [];
    var mapArray = [];
    var mapTextGlobal = [];
    var winningName = "";
    var winningLoc = "";
    var winningUrl = "";
    var canVote = false;
    var canNom = true;


//////////////////////////////////////////////////////
////////modal hides///////
    $("#nomsIn").modal({ show: false});
    $("#winner").modal({ show: false});
    $("#cantVote").modal({ show: false});
    $("#cantNom").modal({ show: false});
//////////////////////////


// user must add credentials before search
$("#credential-cog").on("click", function(event){
    event.preventDefault();
    $("#cred-modal").modal("show");
});

$("#cred-submit-btn").on("click", function(event){
    event.preventDefault();
    var clientId = "client_id=" + $("#modal-input-id").val().trim();
    var clientSecret = "client_secret=" + $("#modal-input-secret").val().trim();

    localStorage.clear();
    localStorage.setItem("storedId", clientId);
    localStorage.setItem("storedSecret", clientSecret);
       
})

    ///////////// refresh after credentials are entered //////
    $(document).ready(function(){
        $("#cred-refresh-btn").click(function(){
            location.reload(true);
        });
    });

////////////////function takes input search term, runs API calls, generates list of suggestions///////////////////////
$("#search-sub-btn").on("click", function(event){
    event.preventDefault();

    ////empties results area with start of each search////

    $("#results-col").empty();
    var keyword = '&query=' + input.val();
    //first call asks API for a list of restuarants within given geoloc
    $.ajax({
        url:'https://api.foursquare.com/v2/venues/search?limit=3&' + clientId + '&' + clientSecret +'&v=20130815&near=Philadelphia' + keyword, 
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
            url:'https://api.foursquare.com/v2/venues/' + venIdArray[j] + '?' + clientId + '&' + clientSecret + '&v=20130815', 
            dataType: 'json',
            ///this function takes the received restaurant information and creates cards for each suggestion containing that info and a nomination button
    }).then(function(response2){
        venDetails = response2.response.venue;
        console.log(venDetails);
        console.log(venDetails.location.lat);
        var geoLat = venDetails.location.lat
        var geoLong = venDetails.location.lng

        
        var newCard = $("<div class='card w-15 nom-card float-left m-1'>");
            
        var cardBody = $("<div class='card-body bg-light text-center'>");
            var cardTitle = $("<h5 class='card-title'>").text(venDetails.name);
            var priceP = $("<p class='suggP'>").text(venDetails.price.message);
            var locP = $("<p class='suggP'>").text(venDetails.location.address);
        
            var nomBtn = $("<a href='#' class='btn btn-primary nomBtn'>").text("Nominate!");
                nomBtn.attr("id", venDetails.id);
                nomBtn.attr("square-url",venDetails.shortUrl);
                nomBtn.attr("venue-name", venDetails.name);
                nomBtn.attr("venue-price", venDetails.price.message);
                nomBtn.attr("venue-loc", venDetails.location.address);
                nomBtn.attr("geo-lat", geoLat);
                nomBtn.attr("geo-lng", geoLong);
        
        cardBody.append(cardTitle, priceP, locP, nomBtn);
        newCard.append(cardBody);
        
        $("#results-col").append(newCard);


    });
  }; 
  });
});

//////////////function allowing 1 item from suggestion list to be 'chosen', sent to firebase database as a 'nomination'//////////////
$(document).on("click", ".nomBtn", function(event){
    event.preventDefault();
    if(canNom === true){
        console.log("click");
        var selected = $(this).attr("id");
        var nameSelected = $(this).attr('venue-name');    
        var priceSelected = $(this).attr('venue-price');
        var locSelected = $(this).attr('venue-loc');
        var squareUrl = $(this).attr('square-url');
        var geoLat = $(this).attr('geo-lat');
        var geoLong = $(this).attr('geo-lng');

        database.ref('nominations').push({
            id: selected,
            name: nameSelected,
            price: priceSelected,
            location: locSelected,
            url: squareUrl,
            lat: geoLat,
            long: geoLong
        });
        
        canNom = false;
    }else{
        $("#cantNom").modal("show");
    }
});
//////////////Takes firebase data, populates ballot, adds pin to map//////////////
database.ref('nominations').on("child_added", function(snapshot) {
    var sv = snapshot.val();
    nominationArray.push(sv);
    
    var newCard = $("<div class='card nomination mb-2'>");
        newCard.attr("id", sv.id);
        newCard.attr("url", sv.url);
        newCard.attr("geo-lat", sv.lat);
        newCard.attr("geo-lng", sv.long)
    var cardHeader= $("<div class='card-header bg-warning text-center'>").text(sv.name);
    var cardBody = $("<div class='card-body p-1 text-center'>");
    var newBlock =$("<div class='blockquote mb-0'>");
        var priceP = $("<p class='nomP text-secondary'>").text("Price: " + sv.price);
        var locP  = $("<p class='nomP text-secondary'>").text(sv.location);
    
    newBlock.append(priceP, locP);
    cardBody.append(newBlock);
    newCard.append(cardHeader, cardBody);

    $("#nom-col").append(newCard);

    if(nominationArray.length === usersCurrent){
        $("#nomsIn").modal("show");
        canVote = true;
    }
    //////////////map pin to map//////////////
    var geocoder = new google.maps.Geocoder;
    var infowindow = new google.maps.InfoWindow;
    var map = new google.maps.Map(document.getElementById('map-col'), {
        zoom: 13,
        center: {lat: 39.9526, lng: -75.1652}
        });

        singlePtArray = [];
        singlePtArray.push(sv.lat);
        singlePtArray.push(sv.long);
        mapArray.push(singlePtArray);

        mapTextGlobal.push(sv.name);
        var mapText = mapTextGlobal;

    // var infoWindow = new google.maps.InfoWindow(), marker, i;
    for(var z = 0; z<mapArray.length; z++){
        function geocodeLatLng(geocoder, map, infowindow) {
            
            var latlng = {lat: parseFloat(mapArray[z][0]), lng: parseFloat(mapArray[z][1])};
            geocoder.geocode({'location': latlng}, function(results, status) {
            if (status === 'OK') {
                if (results[0]) {
                map.setZoom(13);
                var marker = new google.maps.Marker({
                    position: latlng,
                    map: map
                });
                console.log(mapTextGlobal[0]);
                console.log(z);
                infowindow.setContent(mapText[z-1]);
                infowindow.open(map, marker);
                console.log(results[0]);

                
                } else {
                window.alert('No results found');
                }
            } else {
                window.alert('Geocoder failed due to: ' + status);
            }
            });
        }

        geocodeLatLng(geocoder, map, infowindow);
    }
    });

//////////////nominations are clicked, weighted voting occurs//////////////
$(document).on("click", ".nomination", function(){
    if(canVote === true){

        console.log("object clicked pre ifelse ", this);
        //create a var called selected ID this.attr(id)
        var id = $(this).attr("id");
        console.log("id preifelse ", id);

        if(voteCount > 0){
            var selectedId = $(this).attr("id");
            console.log("selectedId, after votecount check ", selectedId);

            if(chosen.indexOf(selectedId) !== -1){//it is in the array
                // alert("Please make another selection");
                console.log("this is already in the chosen array so nothing further happens");
            }else{
                //not in chosen array, so is a valid vote
                chosen.push(selectedId);
                console.log("the chosen array has been updated ", chosen);

                //see if its in the database

                database.ref().once("value", function(snapshot) {
                    if(!snapshot.child('votes').exists() && voteCount === 3){
                        console.log("votes determined to not exist, now created and first nomination and vote added");
                        database.ref('votes').push({
                            id: selectedId,
                            score: 3
                        });
                        voteCount = voteCount-1;
                    }else{
                        console.log("theres already one vote in the database, so we now check if this one has been nominated");
                        console.log("this snapshot was grabbed after it was determined that 'votes' exists ", snapshot);
                        var returnedArray = [];
                        snapshot.child('votes').forEach(function(childSnap){
                            console.log("getting each ID");
                            console.log("this is the childsnap, the one taken to get all the database item ids ", childSnap);
                            item = childSnap.val();
                            item.key = childSnap.key;

                            returnedArray.push(item);
                            console.log("this is the array that we put ids into ", returnedArray);
                            console.log("this is the length of the array ", returnedArray.length);

                            //here we see if the selected Id is in the database
                            
                        });//for each end
                        var idsArray = [];
                        var scoresArray = [];

                            for(var k = 0; k<returnedArray.length; k++){
                                idsArray.push(returnedArray[k].id);
                            }

                            for(var y = 0; y<returnedArray.length; y++){
                                scoresArray.push(returnedArray[y].score);
                            }

                            if(idsArray.indexOf(selectedId) === -1){
                                console.log("it appears to this code that the ID isnt yet in the database, it will be added");
                                database.ref('votes').push({
                                    id: id,
                                    score: voteCount
                                });
                            }else{
                                //if the selected ID matches the id of one of the database entities, I need to take k, which will be the index of the 
                                //database object to be updated, use returned arrays to get the firebase id of that object, and use set to update the changes
                                console.log("we need to update but dont know how");
                                if(idsArray.indexOf(selectedId)!== -1){
                                    var targetIndex = idsArray.indexOf(selectedId);
                                        console.log("this is the index we're looking for ", targetIndex);
                                    var targetKey = returnedArray[targetIndex].key;
                                        console.log("here's the database key to target ", targetKey);
                                    var pathToUpdate = targetKey + "/" + "score";
                                    var scoreToUpdate = returnedArray[targetIndex].score + voteCount;
                                        console.log("This is the going to be the new score value", scoreToUpdate);
                                    database.ref('votes').child(pathToUpdate).set(scoreToUpdate);
                                }
                            }
                        voteCount = voteCount-1;
                        console.log("the updated voteCount for this user is ", voteCount);
                        if(voteCount < 1){
                            database.ref('votersFinished').push({
                                votingComplete: true
                            });

                        }
                    }//end of else that comes after it was determined that 'votes' exists
                });
                
            }//else end of chosen indexof check
            
        }else{
            console.log("user is out of votes");
        }//voteCount super end

    }else{
        $("#cantVote").modal("show");
    }///canVote if statement end
});//vote counting logic end

///////changes color based on which vote it is///////////
$(document).on("click", ".nomination", function(){
    if(canVote===true){
        var clicked = $(this);
        if(voteCount === 3){
            clicked.addClass("voteCount3");
        }
        if(voteCount === 2){
                clicked.addClass("voteCount2");
        }
        if(voteCount === 1){
                clicked.addClass("voteCount1");
        }
    }
});
//////////////When voting done, tallies up the vote//////////////

    
    ////watches votes completed counter, when equal to number of connections, runs tally function
    database.ref('votersFinished').on("child_added", function(snapshot) {
        var newComplete = snapshot.val();

        completedArray.push(newComplete);
        var howManyDone = completedArray.length;
        console.log("users connected is", usersCurrent);
        console.log("voters completed is", howManyDone);

        if(usersCurrent === howManyDone){
            tallyScore();
        }
    
    });
    function tallyScore(){
    
    /////////Get the values of the votes section and push them into an array to be sorted
    database.ref().once("value", function(snapshot){
        snapshot.child('votes').forEach(function(childSnap){
            var sub = childSnap.val();
            compiledArray.push(sub);
        });

        console.log("these are the objects in the votes section", compiledArray);
        console.log("the above array is actually an array?", Array.isArray(compiledArray));
      
        sortedArray = compiledArray.sort(function sorting(a, b){return a.score - b.score});
        console.log("now sorted", sortedArray);
        winner = sortedArray[sortedArray.length-1];
        console.log("and the winner is...", winner.id);

        ///////////now we find the winner's id in the nominations section///////////////

        database.ref('nominations').orderByChild("id").equalTo(winner.id).once("value", function(snapshot) {
            winningObject = snapshot.val();
            transformedWinner = winningObject[Object.keys(winningObject)[0]];
            console.log("name of the winner is ", transformedWinner.name);

            winningName = transformedWinner.name;
            winningLoc = transformedWinner.location;
            winningUrl = transformedWinner.url;


            ///////////////////repop map with winner////////////////
            var geocoder = new google.maps.Geocoder;
            var infowindow = new google.maps.InfoWindow;
            var map = new google.maps.Map(document.getElementById('map-col'), {
                zoom: 13,
                center: {lat: 39.9526, lng: -75.1652}
            });

            function geocodeLatLng(geocoder, map, infowindow) {
            
            var latlng = {lat: parseFloat(transformedWinner.lat), lng: parseFloat(transformedWinner.long)};
            geocoder.geocode({'location': latlng}, function(results, status) {
              if (status === 'OK') {
                if (results[0]) {
                  map.setZoom(13);
                  var marker = new google.maps.Marker({
                    position: latlng,
                    map: map
                  });
                  infowindow.setContent(results[0].formatted_address);
                  infowindow.open(map, marker);
                } else {
                  window.alert('No results found');
                }
              } else {
                window.alert('Geocoder failed due to: ' + status);
              }
            });
          }

          geocodeLatLng(geocoder, map, infowindow);



            $(".winner-addr").append(winningLoc);
            var preurl= "<a href='" + winningUrl + "'target='blank'>" + winningName+ "</a>";
            $(".winner-name").append(preurl);
            $("#winner").modal('show');
            
        });

    });

    };

//////////////use connections to record when voting is complete

    var connectionsRef = database.ref("/connections");
        // '.info/connected' is a boolean value, true if the client is connected and false if they are not.
    var connectedRef = database.ref(".info/connected");

    // When the client's connection state changes...
    connectedRef.on("value", function(snap){
            if(snap.val()){
                var con = connectionsRef.push(true);
                // Remove user from the connection list when they disconnect.
                con.onDisconnect().remove();
            }

    });
    connectionsRef.on("value", function(snap){

            // The number of online users is the number of children in the connections list.
            usersCurrent = snap.numChildren();
            $('#currentUsers').text(usersCurrent).css({"font-weight": "700"});
            console.log("Number of users connected: " + usersCurrent);
    });

    //////////////This function resets neccessary html fields and clears the database///////////

    $("#resetApp").on("click", initReset);


    function initReset(){
        database.ref('resetTrigger').push({
            timeTo: "reset"
        });
        console.log("part 1");
    };
        ////clears resets local values, empties the firebase completely
        function firstClear(){
            console.log("part 2");
            
            $("#results-col").empty();
            $("#nom-col").empty();

            input.val("");
            voteCount = 3;
            chosen = [];
            item = "";
            compiledArray = [];
            sortedArray = [];
            completedArray = [];
            mapArray = [];
            mapTextGlobal = [];
            winner = "";
            transformedWinner = "";
            nominationArray = [];
            canVote = false;
            canNom = true;

            $("#winner").modal("hide");
            $("#nomsIn").modal({ show: false});
            $(".winner-name").empty();
            $(".winner-addr").empty();
            $(".winner-url").empty();
            $("#map-col").empty();

            function mapRePop(){
                var geocoder = new google.maps.Geocoder;
                var infowindow = new google.maps.InfoWindow;
                var map = new google.maps.Map(document.getElementById('map-col'), {
                    zoom: 13,
                    center: {lat: 39.9526, lng: -75.1652}
            });
            }

            mapRePop();

            database.ref().set({
                is: "empty"
            });
      
            
            /////calls reset for users connected so can continue/////
            setTimeout(resetConnections, 2000);
        }
        ////after the database and local enivronment reset, this makes the connections list
        ////back in the database so voting can begin again
        function resetConnections(){
            var connectionsRef = database.ref("/connections");
            // '.info/connected' is a boolean value, true if the client is connected and false if they are not.
            var connectedRef = database.ref(".info/connected");

            // When the client's connection state changes...
            connectedRef.on("value", function(snap){
                    if(snap.val()){
                        var con = connectionsRef.push(true);
                        // Remove user from the connection list when they disconnect.
                        con.onDisconnect().remove();
                    }

            });
            connectionsRef.on("value", function(snap){

                    // The number of online users is the number of children in the connections list.
                    usersCurrent = snap.numChildren();
                    $('#currentUsers').text(usersCurrent).css({"font-weight": "700"});
                    console.log(usersCurrent);
            });
        }

    //////////////looks for reset call////////////////////
    database.ref('resetTrigger').on("child_added", function(snapshot) {
        console.log("waiting for the sun");
        
            firstClear();
    });

    //////////////reset button/////////
    $("#test-reset").on("click", function(){
        initReset();
    });
