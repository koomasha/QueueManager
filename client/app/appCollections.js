if(Meteor.isCordova)
{
	Meteor.subscribe("Branches");
	Meteor.subscribe("Queues");
	Meteor.subscribe("Tickets");
}