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
					var username = result + '@lineapp.com';

					console.log('trying to login');
					Meteor.loginWithPassword(username, result, function(error) {
		        		if (!Meteor.user()){
		        			console.log('login failed. trying to create user');
							var userData = {
								email:username,
								password:result,
							};

			        		Accounts.createUser(userData, function(error) {
	        					if (!Meteor.user()){
	        						console.log('create user failed. what now??');
	        					} else {
        							console.log('user created and logged in');
	        					}
			        		});
		        		}
		        		else {
		        			console.log('login success');
		        		}
		       		});
				}
			},
			function () {
				alert("Operation failed. Please restart the application.");
			}
		);
	});
}