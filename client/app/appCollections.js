if(Meteor.isCordova)
{
	//TODO 
	if(phoneId){
		BeforeTicket = new Meteor.Collection("BeforeTicket");
		Meteor.subscribe('appTickets',phoneId);
	}
}