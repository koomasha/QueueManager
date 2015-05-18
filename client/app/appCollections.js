if(Meteor.isCordova)
{
	Meteor.subscribe("Queues",Session.get("branchId"));
	Meteor.subscribe("Branches");
	Meteor.subscribe("Tickets");
}