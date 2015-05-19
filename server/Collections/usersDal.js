Meteor.publish("boCurrentUser", function () {
		return Meteor.users.find({_id: this.userId}); 

});

