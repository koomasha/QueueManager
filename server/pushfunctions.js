Push.allow({
    send: function(userId, notification) {
        return true;
    }
});

pushSkip = function (ticket){
	if (ticket.phone) {
		var user = Meteor.users.findOne({"emails.address":ticket.phone});
		if (user) {
			var userId = user._id;
			Push.debug = true;
			Push.send({
	            from: 'LineApp',
	            title: 'You have missed your turn!',
	            text: 'Would you like to join again?',
	            query: {userId: userId}
	        });
		}
    }
}

pushOnTurn = function (ticket){
	if (ticket.phone) {
		var user = Meteor.users.findOne({"emails.address":ticket.phone});
		if (user) {
			var userId = user._id;
			Push.debug = true;
			Push.send({
	            from: 'LineApp',
	            title: 'It is your turn!',
	            text: 'Open LineApp to see what station to go to',
	            query: {userId: userId}
	        });
		}
    }
}

pushCloseTurn = function (ticket){
	if (ticket.phone) {
		var user = Meteor.users.findOne({"emails.address":ticket.phone});
		if (user) {
			var userId = user._id;
			Push.debug = true;
			Push.send({
	            from: 'LineApp',
	            title: 'Your turn is close.',
	            text: 'Cannot make it on time? Postpone your turn in LineApp',
	            query: {userId: userId}
	        });
		}
    }
}