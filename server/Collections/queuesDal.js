Meteor.publish("Queues", function (branchid) {
	if(this.userId) {		
		return Queues.find({branchid:branchid});
	}
});

Queues.allow({
  insert: function (userId, branch) {return true;},
});



