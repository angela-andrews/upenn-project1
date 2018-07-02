///it seems very difficult to associate the user's activity with the unique-ID they were assigned when the page loaded.
///this unique id is within a node identified by a randomly generated key, making it hard to target the id for state changes.
///also, every load makes a new id, which build up in the firebase, so unless the firebase is wiped prior to every session (somehow),
///the number of unique id's in the users section doesn't accurately reflect the number of people currently using the app.

///what if instead, we use the firebase .info functionality to simply track how many people are connected to the page, and use the
/// .numChild function to then chart vote progress (albeit crudely, but will tell us when all votes in in a round-about way).

///so we have something that has the code for each user ++ a total vote count in the firebase each time they make a vote, regardless
///of what vote it is.  Then we have a function that says that when this totalVotes equals something like "snapshot.numChildren()*3",
///then voting is complete.  no matter how many users we have, the point of voting completion being reached will always equal the
///number of connected users ( numChild() ) * 3 (votes).


///See firebase Day 2, coding bay view tracker activity

