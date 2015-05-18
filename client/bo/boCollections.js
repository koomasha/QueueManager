if(!Meteor.isCordova)
{
	Meteor.subscribe("Companies");
	Meteor.subscribe("Queues",Session.get("branchId"));
	Meteor.subscribe("Branches");
	Meteor.subscribe("Tickets");

 	Tracker.autorun(function () {
	  	Meteor.subscribe("boUsersInBranch", Session.get("branchId"));
	  	Meteor.subscribe("boUsersByEmail", Session.get("userSearchString"),Session.get("branchId"));
	});

}