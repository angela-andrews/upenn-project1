var voteCount = 1;
    ///global var the tracks what stage of the voting process the user is in
var chosen = [];
    ///records ids of things the user has voted for, so no repeats allowed


on("click", ".nomination", function(){
    ////checks to see if the users voteCount is still less than 4 (initially set to 1), if so vote will continue to progress
    if(voteCount<=3){
        ////using $(this).id, we have the id for the restaurant selected
        ////want to make sure the user hasnt voted for this id yet
        var selectedId = $(this).id

        if(chosen.indexOf(selectedId) !== -1){   //it is in the array
            model("Please make another selection")
        }else{
            chosen.push(selectedId);
            ////check the database to see if an entity has been created with this id, if so
            if(yadayada !== -1){   ///it is in the database
                if(voteCount === 1){
                    database.ref('votes/theId').set({
                        score: score+3
                    });

                }else{
                    if(voteCount === 2){
                    database.ref('votes/theId').set({
                        score: score+2
                    });
                    
                }else{
                    if(voteCount === 3){
                        database.ref('votes/theId').set({
                            score: score++
                        });
                
            }else{
                database.push({
                    id: selectedId,
                    score: 3
                });
            }
        }

    }
})