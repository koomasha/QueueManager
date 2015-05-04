if(!Meteor.isCordova)
{	
	/*//////////////////////////////
	     Sesion Settings
	/////////////////////////////*/
		Session.setDefault('companyName','Queue Manager');
		Session.setDefault('showBoAddBranch',false);
		Session.setDefault('branchId',null);

	/*//////////////////////////////
	     LAYOUT
	/////////////////////////////*/
		Template.boLayout.events({
			'click .logout':function(event){	
				event.preventDefault();
				Meteor.logout();
			}
		});

		Template.boLayout.getCompanyName=function(){
			return Session.get('companyName');
		}
	/*//////////////////////////////
	     LOGIN
	/////////////////////////////*/	
		Template.boLogin.events({
			'submit form':function(event,template){
				event.preventDefault();
				var emailVar = template.find('#login-email').value;
				var passwordVar = template.find('#login-password').value
				Meteor.loginWithPassword(emailVar, passwordVar, function(error) {
		        	if (Meteor.user()) 
		        	{
		            	companyName = Companies.findOne(Meteor.user().profile.company).name;
		            	Session.set('companyName',companyName);
		            	Router.go('/')
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

		Template.boSignup.events({
			'submit form':function(event,template){
				event.preventDefault();
				var companyName = template.find('#sign-up-name').value;
				var emailVar = template.find('#sign-up-email').value;
				var passwordVar = template.find('#sign-up-password').value
				var companyId = addCompany(companyName);
				Accounts.createUser({
					email:emailVar,
					password:passwordVar,
					profile:{
						company:companyId,
					}
					
				});
				Router.go('/')
			}
		});


	/*//////////////////////////////
	     BRANCH
	/////////////////////////////*/
		Template.boAddBranch.events({
			'click .save':function(evt,tmpl){
				var name = tmpl.find('.branch-name').value;
				var location = tmpl.find('.branch-location').value;
				var active = tmpl.find('.branch-active').value;
				console.log(name+location+active);
				addBranch(name,location,active);
				Session.set('showBoAddBranch',false);
			},

			'click .cancel':function(evt,tmpl){
				Session.set('showBoAddBranch',false);
			}
		});

		Template.boBranchList.events({
			'click .add-branch':function(evt,tmpl){
				Session.set('showBoAddBranch',true);
			},

			'click .branchItem':function(evt,tmpl){
				Session.set('branchId',$(evt.target).closest('tr').data('id'));
			}
		});


		Template.boBranches.showBranchDetails=function(id){
			return Session.get('branchId');
		}

		Template.boBranchList.branchList = function(){
			return Branches.find();
		}

		Template.boBranchList.showBoAddBranch = function(){
			return Session.get('showBoAddBranch');
		}

		Template.boBranchDetails.branch = function(){
			return Branches.findOne({_id:Session.get('branchId')});
		}

		var addCompany = function(name)
		{
			return Companies.insert({name:name});

		}
		var addBranch = function(name,location,active){
			Branches.insert({name:name,location:location,active:a});	
		}


}