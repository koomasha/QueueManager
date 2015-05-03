/*Login*/
	Accounts.onLogin(function(){
		Router.go("dashboard");
	});

	Meteor.logout(function(){
		Router.go("bo");
	});

	