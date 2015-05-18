if(Meteor.isCordova)
{
	Meteor.subscribe("Branches");
	Meteor.subscribe("Tickets");
	Tracker.autorun(function () {
	  	Meteor.subscribe("Queues",Session.get("branchId"));
	});
}