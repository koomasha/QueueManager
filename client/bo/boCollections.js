if(!Meteor.isCordova)
{
	Meteor.subscribe('Users');

 	Tracker.autorun(function () {
 		Meteor.subscribe("Branches");
 		Meteor.subscribe("Tickets");
	});
	Tracker.autorun(function () {
	  	Meteor.subscribe("boUsersByEmail", Session.get("userSearchString"),Session.get("branchId"));
	});
	Tracker.autorun(function () {
	  	Meteor.subscribe("Queues",Session.get("branchId"));
	});	
}