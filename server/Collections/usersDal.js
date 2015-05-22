
Meteor.publish("Users", function () {
	if(this.userId) {		
		return Meteor.users.find({}, {fields : {'profile' : 1,'emails':1,_id:1}});
	}
});
