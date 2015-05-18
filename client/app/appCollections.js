if(Meteor.isCordova)
{
	Tracker.autorun(function () {
	  	Meteor.subscribe("Queues",Session.get("branchId"));
	  	Meteor.subscribe("Branches");
		Meteor.subscribe("Tickets");
	});
}