if(!Meteor.isCordova)
{	
	/*//////////////////////////////
	     Sesion Settings
	/////////////////////////////*/

		Session.setDefault('logotext','Queue Manager');
		Session.setDefault('showBoAddBranch',false);
		Session.setDefault('showBoAddUser',false);
		Session.setDefault('branchId',null);
		Session.setDefault('branchSearchString',null);
		Session.setDefault('userSearchString',null);
		Session.setDefault('userId',null);
		Session.setDefault('queueId',null);
		Session.setDefault('showWorkStation',false);
		Session.setDefault("showBoAddQueue",false);
		Session.setDefault("queueSearchString",null);
		Session.setDefault("showBoAddKiosk",false);

  		boUsersInBranch = new Meteor.Collection("boUsersInBranch");
  		boUsersByEmail = new Meteor.Collection("boUsersByEmail");

	$('#BranchTabs a').click(function (e) {
	  e.preventDefault()
	  $(this).tab('show')
	});



	/*//////////////////////////////
	     LAYOUT
	/////////////////////////////*/
		Template.boLayout.events({
			'click .logout':function(event){	
				event.preventDefault();
				Meteor.logout();
			}
		});

		Template.boLayout.helpers({
			getLogoText:function(){
				return Session.get('logotext');
			}
		});

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
				var emailVar = template.find('#sign-up-email').value;
				var passwordVar = template.find('#sign-up-password').value;
				Accounts.createUser({
					email:emailVar,
					password:passwordVar					
				});
				Router.go('/')
			}
		});


	/*//////////////////////////////
	     BRANCH
	/////////////////////////////*/
		Template.boBranches.helpers({
			showBranchDetails: 	function(id){
				return Session.get('branchId');
			}
		});	

		Template.boAddBranch.events({
			'click .save':function(evt,tmpl){
				var name = tmpl.find('.branch-name').value;
				var location = tmpl.find('.branch-location').value;
				var active = tmpl.find('.branch-active').value;
				Branches.insert({name:name,location:location,active:active});
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
				Session.set('branchId',$(evt.target).closest('div').data('id'));
				Session.set('queueId',null);
				Session.set('showWorkStation',false);
				Meteor.subscribe("Queues",Session.get("branchId"));
			},
			'keyup input.search-branch': function (evt) {
		        Session.set("branchSearchString", evt.currentTarget.value);
		    }, 
		});

		Template.boBranchList.helpers({
		    branchList: function () {
		    	var searchString = Session.get("branchSearchString");
		    	if(searchString)
		    		return Branches.find({"name": new RegExp(searchString)});
		    	else
		    		return Branches.find();
		    },
		    showBoAddBranch:function(){
				return Session.get('showBoAddBranch');
			}
  		});

  		Template.boBranchDetails.helpers({
  			branch:function(){
				return Branches.findOne({_id:Session.get('branchId')});
			}
  		});

  		/*//////////////////////////////
	     USERS
		/////////////////////////////*/	
  		Template.boBranchUsers.helpers({
  			showBoAddUser:function(){
				return Session.get('showBoAddUser');
			},
			showBoAddKiosk:function(){
				return Session.get('showBoAddKiosk');
			},
  		});

 		Template.boBranchUsers.events({
			'keyup input.search-user': function (evt) {
		        Session.set("userSearchString", evt.currentTarget.value);
		    }, 
		    'click .add-user' : function(evt,tmpl){
		    	Session.set("showBoAddUser",true);
		    },  
		    'click .add-kiosk' : function(evt,tmpl){
		    	Session.set("showBoAddKiosk",true);
		    },
  		});

  		Template.boUserList.helpers({
		    userList: function () {
		    	var searchString = Session.get("userSearchString");
		    	if(searchString)
					return boUsersInBranch.find({email:new RegExp(searchString)});
		    	else
  					return boUsersInBranch.find();
		    },
		 	
		});

		Template.boAddUser.helpers({
			newUserList: function(){
				var searchString = Session.get("userSearchString");
		    	if(searchString)
		    	{
					if(boUsersByEmail.find().count() > 0)
						return boUsersByEmail.find();
		    	}
			}
		});

  		Template.boAddUser.events({
  			'click .cancel': function(evt,tmpl){
  				Session.set("showBoAddUser",false);
  				Session.set("userSearchString",null);
  			},

  			'click .userItem' :function(evt,tmpl){
  				$('td').css('background','#fff');
  				Session.set('userId', $(evt.target).closest('tr').data('id'));
  				$(evt.target).closest('td').css('background','#5DBB5D');
  			},
			'keyup input.search-new-user': function (evt) {
		        Session.set("userSearchString", evt.currentTarget.value);
		    }, 
		    'click .save':function(evt,tmpl){
				Branches.update({ _id:Session.get('branchId') },{ $push: {users: { userid: Session.get('userId'), role: 'Clerk' }}});
				Session.set('userId',null);
				Session.set("showBoAddUser",false);
  				Session.set("userSearchString",null);
  				Tracker.autorun(function () {
				  	Meteor.subscribe("boUsersInBranch", Session.get("branchId"));
				  	Meteor.subscribe("boUsersByEmail", Session.get("userSearchString"),Session.get("branchId"));
				});
			},
  		});

		Template.boAddKiosk.events({
			'click .cancel': function(evt,tmpl){
  				Session.set("showBoAddKiosk",false);
  				Session.set("userSearchString",null);
  			},
  			'click .save-kiosk':function(evt,tmpl){
				event.preventDefault();
				var email = tmpl.find('.kiosk-name').value;
				var password = tmpl.find('.kiosk-password').value;
				var kioskName = tmpl.find('.kiosk-name').value;
				var active = tmpl.find('.kiosk-active').value;
				Meteor.users.insert({
					email:email,
					password:password,
					profile:{
						name:kioskName,
						branchid:Session.get('branchId'),
						active:active,
						queues:[],
					}
									
				});
				Session.set("showBoAddKiosk",false);
			}
		});
		/*//////////////////////////////
	     QUEUES
		/////////////////////////////*/
		Template.boBranchQueues.helpers({
			showWorkStation : function(){
				return Session.get('showWorkStation');
			},
			showBoAddQueue : function(){
				return Session.get('showBoAddQueue');
			}
		});

		Template.boBranchQueues.events({
			'click .add-queue' : function(evt,tmpl){
		    	Session.set("showBoAddQueue",true);
		    },
		    'keyup input.search-queue': function (evt) {
		        Session.set("queueSearchString", evt.currentTarget.value);
		    }, 
		    'click .close-workstation' : function(evt,tmpl){
		    	Session.set('queueId',null);
				Session.set('showWorkStation',false);
		    },	
		});

		Template.boQueueList.helpers({
			queueList: function(){
				var searchString = Session.get("queueSearchString");
		    	if(searchString)
					return Queues.find({name:new RegExp(searchString),branchid:Session.get('branchId')}).fetch();
		    	else
  					return Queues.find({branchid:Session.get('branchId')}).fetch();
		    	
			},

		});
		Template.boQueueList.events({
			'click .queueItem':function(evt,tmpl){
				Session.set('queueId',$(evt.target).closest('div').data('id'));
				Session.set('showWorkStation',true);
			},
		});

		Template.boAddQueue.events({
			'click .save':function(evt,tmpl){
				var name = tmpl.find('.queue-name').value;
				var active = tmpl.find('.queue-active').value;
				var showtoclerk = !(tmpl.find('.queue-permission').checked);
				var prefix = tmpl.find('.queue-prefix').value;
				Queues.insert({name:name,showtoclerk:showtoclerk,active:active,prefix:prefix,branchid:Session.get('branchId')});
				Session.set('showBoAddQueue',false);
			},

			'click .cancel':function(evt,tmpl){
				Session.set('showBoAddQueue',false);
			}
		});
}
