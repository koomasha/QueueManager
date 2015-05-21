if(!Meteor.isCordova)
{	
/*//////////////////////////////
     SESSION SETTINGS
/////////////////////////////*/

	boUsersInBranch = new Meteor.Collection("boUsersInBranch");
	boUsersByEmail = new Meteor.Collection("boUsersByEmail");

	Session.setDefault('logotext','iTickets');

	Session.setDefault('showBoModal',false);
	Session.setDefault('showBoQueueList',true);
	Session.setDefault('showBoAdditionalDetails',false);
	Session.setDefault('showBoWorkStation',false);
	Session.setDefault("showBoAddQueue",false);
	Session.setDefault("showBoAddKiosk",false);
	Session.setDefault('showBoAddBranch',false);
	Session.setDefault('showBoAddUser',false);
	Session.setDefault('showBoQueueStatistics',false);

	Session.setDefault('branchId',null);
	Session.setDefault('userId',null);
	Session.setDefault('queueId',null);
	Session.setDefault('branchSearchString',null);
	Session.setDefault('userSearchString',null);
	Session.setDefault("queueSearchString",null);

	Session.setDefault("ticket",null);
	Session.setDefault('clientsInLine',null)


	Session.setDefault('boModalTitle','');
	Session.setDefault('boModalContent','');
	Session.setDefault('boModalButton','');
	Session.setDefault('boModalButtonColor','');
	Session.setDefault('boModalAction','');

	Session.setDefault('boGeoAddress',"Rabenu Yeruham Street, Tel Aviv-Yafo, Israel");
	Session.setDefault('boGeoCoordinates',null);

	var setModalData = function(title,content,button,color,action){
		Session.set('boModalTitle',title);
		Session.set('boModalContent',content);
		Session.set('boModalButton',button);
		Session.set('boModalButtonColor',color);
		Session.set('boModalAction',action);
	}
/*//////////////////////////////
     STARTUP
/////////////////////////////*/

	Meteor.startup(function() {  
	  GoogleMaps.load({
	  	libraries: 'places',
	  	key:'AIzaSyBfYO6YHpsMhHKPCsunDrgC1aH-gUflWfQ'
	  });
	});

	Template.map.rendered = function () {
		Tracker.autorun(function () {
			if (GoogleMaps.loaded()) {
				$('#geoInput').geocomplete({map: $("#geoMap"),location:Session.get('boGeoAddress')}).bind("geocode:result", function(event, result){
					Session.set('boGeoAddress',result.formatted_address);
					Session.set('boGeoCoordinates',{lat:result.geometry.location.A,lng:result.geometry.location.F});
				});
			}
		});
	}

/*//////////////////////////////
     GLOBAL HELPERS
/////////////////////////////*/
	Template.registerHelper("userIsManager", function () {
		var user = Branches.find({_id:Session.get('branchId'),
									users:{$elemMatch:{userid:Meteor.user()._id,role:{$in:['Admin','Manager']}}}}).fetch();
			if(user.length > 0) return true;
			return false;
	});
	Template.registerHelper("userIsAdmin", function () {
		var user = Branches.find({_id:Session.get('branchId'),users:{$elemMatch:{userid:Meteor.user()._id,role:{$in:['Admin']}}}}).fetch();
		if(user.length > 0) return true;
		return false;
	});
	Template.registerHelper("queueName", function () {
		if(Session.get('queueId'))
			return Queues.findOne({_id:Session.get('queueId')}).name;
		return '';
	});

	Template.registerHelper('showBoModal',function(){
			return Session.get('showBoModal');
	});
	Template.registerHelper('branch',function(){
		if(this._id){
			var branch = Branches.findOne({_id:this._id});
			if(branch)
				return branch;
		}	
		else if(Session.get('branchId'))
			return  Branches.findOne({_id:Session.get('branchId')});
		return {};

	});

	Template.registerHelper('selected',function(type,value){
		if(value == type)
		{
			return 'selected';
		}
		return '';
	});

/*//////////////////////////////
     MODAL
/////////////////////////////*/
	Template.boModal.events({
		'click .cancel':function(evt,tmpl){
			Session.set('showBoModal',false);
			Session.set('showBoAddBranch',false);
			Session.set('showBoAddQueue',false);
		},
		'click .save-remove':function(evt,tmpl){
			Session.set('showBoModal',false);
			Queues.remove({_id:Session.get('queueId')});
		},
		'click .save-unpublic':function(evt,tmpl){
			Session.set('showBoModal',false);
			Queues.update({ _id:Session.get('queueId') },{ $set: {showtoclerk:false}});
		},
		'click .save-public':function(evt,tmpl){
			Session.set('showBoModal',false);
			Queues.update({ _id:Session.get('queueId') },{ $set: {showtoclerk:true}});
		},
		'click .save-active':function(evt,tmpl){
			Session.set('showBoModal',false);
			Queues.update({ _id:Session.get('queueId')},{ $set: {active:true}});
		},	
		'click .save-unactive':function(evt,tmpl){
			Session.set('showBoModal',false);
			Queues.update({ _id:Session.get('queueId')},{ $set: {active:false}});
		},
		'click .save-add-branch':function(evt,tmpl){
			var name = tmpl.find('.branch-name').value;
			var active = (tmpl.find('.branch-active').value == "true");
			var password = tmpl.find('.branch-password').value;
			if(name && password){
				Branches.insert({name:name,password:password,address:Session.get("boGeoAddress"),location:Session.get("boGeoCoordinates"),active:active});
				Session.set('showBoAddBranch',false);
				Session.set('showBoModal',false);
			}
			else if(name)
				$('.branch-name').addClass('data-missing');
			else
				$('.branch-password').addClass('data-missing');
		},
		'click .save-edit-branch':function(evt,tmpl){
			var name = tmpl.find('.branch-name').value;
			var active = (tmpl.find('.branch-active').value == "true");
			var password = tmpl.find('.branch-password').value;
			if(name && password){
				Branches.update({ _id:Session.get('branchId') },{$set:{name:name,password:password,address:Session.get("boGeoAddress"),location:Session.get("boGeoCoordinates"),active:active}});
				Session.set('showBoAddBranch',false);
				Session.set('showBoModal',false);
			}
			else if(name)
				$('.branch-name').addClass('data-missing');
			else
				$('.branch-password').addClass('data-missing');
		},
		'click .save-delete-branch':function(evt,tmpl){
			Session.set('showBoModal',false);
			var queues = Queues.find({branchid:Session.get('branchId')}).fetch();
			var tickets = Tickets.find({queueId:{$in:queues.map(function(q){return q._id;})}}).fetch();
			for(var i = 0; i < tickets.length; i++)
				Tickets.remove({_id:tickets[i]._id});
			for(var i = 0; i < queues.length; i++)
				Queues.remove({_id:queues[i]._id});
			Branches.remove({_id:Session.get('branchId')});
		},
		'click .save-add-queue':function(evt,tmpl){
			Session.set('showBoModal',false);
			var name = tmpl.find('.queue-name').value;
			var active = (tmpl.find('.queue-active').value == 'true');
			var showtoclerk = !(tmpl.find('.queue-permission').checked);
			var prefix = tmpl.find('.queue-prefix').value;
			if(name){
				Queues.insert({name:name,showtoclerk:showtoclerk,active:active,prefix:prefix,branchid:Session.get('branchId')});
				Session.set('showBoAddQueue',false);
			}
			else
				$('.queue-name').addClass('data-missing');
		},
		'click input':function(){
			$('input').removeClass('data-missing');
		},

	});

	Template.boModal.helpers({
		modalTitle:function(){
			return Session.get('boModalTitle');
		},
		modalContent:function(){
			return Session.get('boModalContent');
		},
		modalButton:function(){
			return Session.get('boModalButton');
		},
		modalButtonColor:function(){
			return Session.get('boModalButtonColor');
		},
		modalAction:function(){
			return Session.get('boModalAction');
		},
		showBoAddBranch:function(){
			return Session.get('showBoAddBranch');
		},
		showBoAddQueue:function(){
			return Session.get('showBoAddQueue');
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

	Template.boBranchList.events({
		'click .add-branch':function(evt,tmpl){
			Session.set('showBoAddBranch',true);
			Session.set('showBoModal',true);
			Session.set('branchId',null)
			setModalData(
				'Create new branch',
				'',
				'Save','warning','add-branch');
		},

		'click .branchItem':function(evt,tmpl){
			Session.set('branchId',$(evt.target).closest('div').data('id'));
			Session.set('queueId',null);
			Session.set('showBoWorkStation',false);
			Session.set('showBoAdditionalDetails',false);
			Session.set('showBoQueueList',true);

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
	});

	Template.boBranchDetails.events({
		'click .edit-branch':function(){
			Session.set('showBoAddBranch',true);
			Session.set('showBoModal',true);

			setModalData(
				'Edit branch',
				'',
				'Save','warning','edit-branch');
		},
		'click .delete-branch':function(){
			Session.set('showBoModal',true);
			var branchName = Branches.findOne({_id:Session.get('branchId')}).name;
			setModalData(
				'Delete branch',
				'Are you shure you want to delete ' + branchName +'?',
				'Delete','danger','delete-branch');
		},
	});


/*//////////////////////////////
     QUEUES
/////////////////////////////*/
	Template.boBranchQueues.helpers({
		showBoWorkStation : function(){
			return Session.get('showBoWorkStation');
		},
		showBoAdditionalDetails: function(){
			return Session.get('showBoAdditionalDetails');
		},
		showBoQueueList:function(){
			return Session.get('showBoQueueList');
		},
		showBoQueueStatistics: function(){
			return Session.get('showBoQueueStatistics');
		},
		queueList: function(){
			var searchString = Session.get("queueSearchString");
	    	if(searchString)
				return Queues.find({name:new RegExp(searchString),branchid:Session.get('branchId')}).fetch();
	    	else
				return Queues.find({branchid:Session.get('branchId')}).fetch();
	    	
		},
	});

	Template.boBranchQueues.events({
		'click .add-queue' : function(evt,tmpl){
	    	Session.set("showBoAddQueue",true);
	    	Session.set("showBoModal",true);
	    	setModalData(
				'Add new queue',
				'',
				'Save','warning','add-queue');
			},
	    'keyup input.search-queue': function (evt) {
	        Session.set("queueSearchString", evt.currentTarget.value);
	    },

	});

	Template.boQueueHeader.events({
		'click .close-queue' : function(evt,tmpl){
	    	Session.set('queueId',null);
			Session.set('showBoWorkStation',false);
			Session.set('showBoAdditionalDetails',false);
			Session.set('showBoQueueStatistics',false);
			Session.set('showBoQueueList',true);
	    }, 
	});

	Template.boQueueItem.events({
		'click .open-workstation':function(evt,tmpl){
			Session.set('queueId',$(evt.target).closest('div').data('id'));
			Session.set('showBoWorkStation',true);
			Session.set('showBoQueueList',false);
			var currTicket = Tickets.findOne({queueId:Session.get('queueId'), userid:Meteor.user()._id, status:"Getting Service"});
			if(currTicket){
				Session.set('ticket',currTicket);
			}
			else if(Session.get('ticket'))
				if(Session.get('queueId') != Session.get('ticket').queueId)	
					Session.set('ticket',null);
		},
		'click .active-queue':function(evt,tmpl){
			Session.set('queueId',$(evt.target).closest('div').data('id'));				
			var queueName = Queues.findOne({_id:Session.get("queueId")}).name;
			Session.set('showBoModal',true);

			setModalData(
				'Close '+queueName,
				'Set '+ queueName+' to closed',
				'Save','warning','unactive');
		},

		'click .unactive-queue':function(evt,tmpl){
			Session.set('queueId',$(evt.target).closest('div').data('id'));
			Session.set('showBoModal',true);

			var queueName = Queues.findOne({_id:Session.get("queueId")}).name;
			Session.set('showBoModal',true);

			setModalData(
				'Open '+queueName,
				'Set '+ queueName+' to open',
				'Save','warning','active');
		},				
		'click .public-queue':function(evt,tmpl){
			console.log($(evt.target));
			Session.set('queueId',$(evt.target).closest('div').data('id'));
			Session.set('showBoModal',true);

			var queueName = Queues.findOne({_id:Session.get("queueId")}).name;
			Session.set('showBoModal',true);

			setModalData(
				'Change '+queueName+' access privileges',
				'Set '+ queueName+' be visible only by managers',
				'Save','warning','unpublic');
		},		
		'click .unpublic-queue':function(evt,tmpl){
			Session.set('queueId',$(evt.target).closest('div').data('id'));
			Session.set('showBoModal',true);
			var queueName = Queues.findOne({_id:Session.get("queueId")}).name;
			Session.set('showBoModal',true);
			setModalData(
				'Change '+queueName+' access privileges',
				'Set '+ queueName+' be visible to all',
				'Save','warning','public');
		},				
		'click .add-details-to-queue':function(evt,tmpl){
			Session.set('showBoAdditionalDetails',true);
			Session.set('queueId',$(evt.target).closest('div').data('id'));
			Session.set('showBoQueueList',false);
		},
		'click .remove-queue':function(evt,tmpl){
			Session.set('queueId',$(evt.target).closest('div').data('id'));
			var queueName = Queues.findOne({_id:Session.get("queueId")}).name;
			Session.set('showBoModal',true);
			setModalData(
				'Delete queue '+queueName,
				'Please confirm deletion of '+ queueName,
				'Delete','danger','remove');
		},
		'click .queue-statistics':function(evt,tmpl){
			Session.set('queueId',this._id);
			Session.set('showBoQueueStatistics',true);
			Session.set('showBoQueueList',false);
		}
	});

	Template.boQueueItem.helpers({
		queueIsActive:function(queueId){
			var queue = Queues.findOne({_id:queueId});
			if(queue && queue.active)
				return true;
			return false;
		},
		queueIsPublic:function(queueId){
			var queue = Queues.findOne({_id:queueId});
			if(queue)
				return queue.showtoclerk;
			return false;
		},

		showClientsInLine:function(queueId){
			var clients = Queues.findOne({_id:queueId});
			if(clients){
				if(clients.opentickets > 0)
				{
					Session.set('clientsInLine',clients.opentickets);
					return true;
				}
				Session.set('clientsInLine',null);
			}	
			return false;
		},
		clientsInLine:function(){
			return Session.get('clientsInLine');
		},
	});

/*//////////////////////////////
     WORKSTATION
/////////////////////////////*/
	Template.boQueueWorkStation.helpers({
		ticket: function(){
			return Session.get("ticket");
		},
		nextTicket: function(){
			if(Session.get('queueId'))
				if(Queues.findOne({_id:Session.get('queueId')}).opentickets > 0)
					return Queues.findOne({_id:Session.get('queueId')}).currentSec+1;
				else return '--';
		},
		openTickets: function(){
			if(Session.get('queueId'))
				return Queues.findOne({_id:Session.get('queueId')}).opentickets;
		},
	});

	Template.boQueueWorkStation.events({
		'click .next-ticket':function(evt,tmpl){
			var queue = Queues.findOne({_id:Session.get('queueId')});
			if(queue.opentickets > 0){
				Meteor.call('boNextTicket',Session.get('queueId'),function(err, data) {Session.set('ticket', data)});
			}
		},
	});

	Template.boTicketDetails.helpers({
		currentTicket: function(){
			if(Session.get('ticket'))
				return Session.get('ticket').sequence;
			else return '--';
		},
		clientInput:function(){
			return Tickets.findOne({_id:Session.get('ticket')._id}).additionalDetails;
		}

	});

	Template.boTicketDetails.events({
		'click .done-ticket':function(evt,tmpl){
			comment = tmpl.find('.ticket-comment').value;
			Meteor.call('boDoneTicket',Session.get('ticket'),comment);
			Session.set('ticket',null);
		},


		'click .skip-ticket':function(evt,tmpl){
			comment = tmpl.find('.ticket-comment').value;
			Meteor.call('boSkipTicket',Session.get('ticket'),comment);
			Session.set('ticket',null);
		},
	});
/*//////////////////////////////
     ADDITIONAL DETAILS
/////////////////////////////*/
	Template.boAdditionalDetails.helpers({
		additionalDetails:function(){
			var queue = Queues.findOne({_id:Session.get("queueId")});
			if(queue)
				return queue.additionalDetails;
			return [];
		},
	});

	Template.boAdditionalDetails.events({
		'click .add-property':function(evt,tmpl){
			var new_name = tmpl.find('.new-property-name').value;
			if(new_name)
			{
				var new_type = tmpl.find('.new-property-type').value;
				var property = {
					name:new_name,
					type:new_type
				};
				tmpl.find('.new-property-name').value = '';
				tmpl.find('.new-property-type').value = 'appText';
				Queues.update({ _id:Session.get('queueId')  },{ $push: { additionalDetails:property}});
				$(evt.target).closest('div .new-property-item').find('input')[0].className.replace(' data-missing','');

			}
			else
			{
				$(evt.target).closest('div .new-property-item').find('input')[0].className += ' data-missing';
			}


		},
		'click .new-property-name':function(evt,tmpl){
			var newClass = $(evt.target)[0].className.replace(' data-missing','')
			$(evt.target)[0].className = newClass;
		}

	});

	Template.boAdditionalDetailsItem.events({
		'click .remove-property':function(evt,tmpl){	
			var properties = Queues.findOne({_id:Session.get('queueId')}).additionalDetails;
			var newProp = [];
			var flag = false;
			for(var i = 0; i < properties.length; i++){
				if(properties[i].name != this.name || properties[i].type != this.type || flag){
					 newProp.push(properties[i]);
				}
				else flag = true;

			}
			Queues.update({ _id:Session.get('queueId') },{ $set: {additionalDetails:newProp}});
		},
		'click .edit-property':function(evt,tmpl){	
			var new_name = $(evt.target).closest('div .property-item').find('input')[0].value;
			var new_type = $(evt.target).closest('div .property-item').find('select')[0].value;

			var properties = Queues.findOne({_id:Session.get('queueId')}).additionalDetails;
			var newProp = [];
			var flag = false;
			for(var i = 0; i < properties.length; i++){
				if(properties[i].name != this.name || properties[i].type != this.type || flag){
					 newProp.push(properties[i]);
				}
				else {
					newProp.push({name:new_name,type:new_type});	
					flag = true;
				}

			}
			Queues.update({ _id:Session.get('queueId') },{ $set: {additionalDetails:newProp}});
			$(evt.target)[0].title = 'Saved';
			$(evt.target)[0].className = 'glyphicon glyphicon-floppy-saved green-icon';
		},

		'keyup input.property-name': function (evt) {
	       $(evt.target).closest('div .property-item').find('div .edit-property')[0].children[0].title ='Click to save';
	        $(evt.target).closest('div .property-item').find('div .edit-property')[0].children[0].className = 'glyphicon glyphicon-floppy-save icon red-icon';
	    },
	    'change select.property-type': function (evt) {
	       $(evt.target).closest('div .property-item').find('div .edit-property')[0].children[0].title ='Click to save';
	        $(evt.target).closest('div .property-item').find('div .edit-property')[0].children[0].className = 'glyphicon glyphicon-floppy-save icon red-icon';
	    },
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
			$('.userItem').removeClass('selected-user','');
			$('.userItem').addClass('icon');
			Session.set('userId', $(evt.target).closest('div').data('id'));
			$(evt.target).closest('div').addClass('selected-user');
			$(evt.target).closest('div').removeClass('icon');
		},
		'keyup input.search-new-user': function (evt) {
	        Session.set("userSearchString", evt.currentTarget.value);
	    }, 
	    'click .save':function(evt,tmpl){
	    	Branches.update({ _id:Session.get('branchId') },{ $push: {users: { userid:Session.get('userId'), role:'Clerk' }}});
			Session.set('userId',null);
			Session.set("showBoAddUser",false);
				Session.set("userSearchString",null);
				$('.userItem').removeClass('icon');
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
     
/////////////////////////////*/		

}