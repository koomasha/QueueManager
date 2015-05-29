if(Meteor.isCordova)
{
	Meteor.startup(function () {
		window.plugins.uniqueDeviceID.get(
			function (result) {
				console.log("phone id is: " + result);
				Session.set('phoneid', result);

				if(result){
					BeforeTicket = new Meteor.Collection("BeforeTicket");
					QueuesSub = Meteor.subscribe('appTickets',result);
				}

			},
			function () {
				alert("Operation failed. Please restart the application.");
			}
		);
	});
}