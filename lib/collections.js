Queues = new Meteor.Collection("queues");
Tickets = new Meteor.Collection("tickets");


if(Meteor.isServer)
{
/*	Meteor.publish("Queues", function () {
	  return Queues.find(); // everything
	});
*/
	Meteor.publish("Tickets", function () {
	  return Tickets.find(); // everything
	});


}

if(Meteor.isClient)
{


}