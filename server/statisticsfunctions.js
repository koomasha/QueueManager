Meteor.methods({
    statisticsAverageTicketTime : function(from, to, queueId){
        var sumTimes = 0;
        var count = 0;
        Tickets.find({
            createdTime:{
                $gte:from,
                $lt:to},
            queueId:queueId,
            status:"DONE"
        }).forEach(function(ticket){
            sumTimes += ticket.serviceEndTime - ticket.createdTime;
            count += 1;
        });
        if (count === 0) {
            return "--";
        }
        return sumTimes/count;
    }
})