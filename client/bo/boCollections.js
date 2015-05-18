if(!Meteor.isCordova)
{
 	Tracker.autorun(function () {
	  	Meteor.subscribe("boUsersInBranch", Session.get("branchId"));
	  	Meteor.subscribe("boUsersByEmail", Session.get("userSearchString"),Session.get("branchId"));
	  	Meteor.subscribe("Queues",Session.get("branchId"));
	  	Meteor.subscribe("Branches");
		Meteor.subscribe("Tickets");
	});

}