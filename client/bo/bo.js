/*Login*/
	Template.login.events({
		'submit form':function(event,template){
			event.preventDefault();
			var emailVar = template.find('#login-email').value;
			var passwordVar = template.find('#login-password').value
			Meteor.loginWithPassword(emailVar, passwordVar, function(error) {
	        	if (Meteor.user()) 
	        	{
	            	Router.go('/bo')
	        	} 
	        	else 
	        	{
	           		var message = "There was an error logging in: <strong>" + error.reason + "</strong>";
	           		Console.log(message);
	       		}
	       		return;
        	});
		}
	});

	Template.signup.events({
		'submit form':function(event,template){
			event.preventDefault();
			var emailVar = template.find('#sign-up-email').value;
			var passwordVar = template.find('#sign-up-password').value
			Accounts.createUser({
				email:emailVar,
				password:passwordVar
			});
			Router.go('/bo')
		}
	});

	Template.bolayout.events({
		'click .logout':function(event){	
			event.preventDefault();
			Meteor.logout();
			//Router.go('/')
		}
	});
