	Meteor.publish("Tickets", function () {
	  return Tickets.find(); // everything
	});

	Tickets.allow({
  		insert: function (userId, branch) {return true;},
	});
