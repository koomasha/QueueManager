Meteor.methods({
    statisticsAverageTicketTime : function(from, to, queueOrBranch, queueOrBranchId){
        var sumTimes = 0;
        var count = 0;
        var match = {
            creationTime:{
                $gte:Number(from),
                $lt:Number(to)},
        //    queueId:queueOrBranchId,
            status:"Done"
        };
        match[queueOrBranch+"Id"]=queueOrBranchId;
        Tickets.find(match).forEach(function(ticket){
            console.log("in foreach with ticket " + JSON.stringify(ticket));
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
        var match = {
            creationTime:{
                $gte:Number(from),
                $lt:Number(to)},
            //queueId:queueOrBranchId,
            status:"Done"};
        match[queueOrBranch+"Id"]=queueOrBranchId;

        var result = Tickets.aggregate([
            {$match:match},
            {$group: {
                _id:"$clerk", count: {$sum: 1}}
            },
            {$sort:{count:-1}}]);
        console.log("aggregation result is " + JSON.stringify(result));
        if (result[0].count === 0) {
            return "--";
        }
        return result[0]._id + " - " + result[0].count + " tickets";
    },
    testAddTicketToQueue : function(ticket, update){
        var id=Tickets.insert(ticket);
        Tickets.update(id,{$set:update});
        return "inserted ticket " + id;
    }
});