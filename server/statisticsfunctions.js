Meteor.methods({
    statisticsAverageTicketTime : function(from, to, queueOrBranch, queueOrBranchId){
        var sumTimes = 0;
        var count = 0;
        var match = {
            creationTime:{
                $gte:Number(from),
                $lt:Number(to)},
            status:"Done"
        };
        match[queueOrBranch+"Id"]=queueOrBranchId;
        Tickets.find(match).forEach(function(ticket){
            sumTimes += ticket.serviceEndTime - ticket.creationTime;
            count += 1;
        });
        if (count === 0) {
            return "--";
        }
        var averageDuration=sumTimes/count;
        var formattedDuration="";
        var days=moment.duration(averageDuration).days();
        var hours=moment.duration(averageDuration).hours();
        var minutes=moment.duration(averageDuration).minutes();
        if(days>0){
            formattedDuration += days + "days, ";
        }
        if(hours>0){
            formattedDuration += hours + " hours, ";
        }
        formattedDuration += moment.duration(averageDuration).minutes() + " minutes";
        return formattedDuration;
    },
    statisticsTopClerk : function(from, to, queueOrBranch, queueOrBranchId){
        console.log("Getting top clerk for " + queueOrBranch + " with id " + queueOrBranchId);
        var match = {
            creationTime:{
                $gte:Number(from),
                $lt:Number(to)},
            status:"Done"};
        match[queueOrBranch+"Id"]=queueOrBranchId;

        var result = Tickets.aggregate([
            {$match:match},
            {$group: {
                _id:"$userId", count: {$sum: 1}}
            },
            {$sort:{count:-1}}]);
        console.log("aggregation result is " + JSON.stringify(result));
        if (result[0] == undefined || result[0].count === 0) {
            return "--";
        }
        var clerkName = Meteor.users.findOne({_id:result[0]._id}).profile.name;
        return clerkName + " - " + result[0].count + " tickets";
    },
    testAddTicketToQueue : function(queueId, update){
        Meteor.call('addUserToQueue', "123", queueId,function(err,success){});
    //    var id=Tickets.insert(ticket);
    //    Tickets.update(id,{$set:update});
    }
});