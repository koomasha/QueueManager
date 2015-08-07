if(!Meteor.isCordova)
{	
/*//////////////////////////////
     SESSION SETTINGS
/////////////////////////////*/

	boUsersInBranch = new Meteor.Collection("boUsersInBranch");
	boUsersByEmail = new Meteor.Collection("boUsersByEmail");

	Session.setDefault('logotext','LineApp');

	Session.setDefault('showBoModal',false);
	Session.setDefault('showBoQueueList',true);
	Session.setDefault('showBoAdditionalDetails',false);
	Session.setDefault('showBoWorkStation',false);
	Session.setDefault("showBoAddQueue",false);
	Session.setDefault('showBoAddBranch',false);
	Session.setDefault('showBoAddUser',false);
	Session.setDefault('showBoQueueStatistics',false);
	Session.setDefault('showBoQueuePrefix',false);
	Session.setDefault('showBoLoginForm',true);
	Session.setDefault('showBoSignUpForm',false);
	Session.setDefault('showBoAlert',false);
	Session.setDefault('showBoChangeUserRole',false);
	Session.setDefault("showBoMyProfile",false);
	Session.setDefault('showBoChangeClerkStation',false);
	Session.setDefault('branchId',null);
	Session.setDefault('userId',null);
	Session.setDefault('queueId',null);
	Session.setDefault('branchSearchString',null);
	Session.setDefault('userSearchString',null);
	Session.setDefault("queueSearchString",null);
	Session.setDefault('clerkStationNumber',0);
	Session.setDefault("ticket",null);
	Session.setDefault('boModalTitle','');
	Session.setDefault('boModalContent','');
	Session.setDefault('boModalButton','');
	Session.setDefault('boModalButtonColor','');
	Session.setDefault('boModalAction','');
	Session.setDefault('boAlertText',null);

	Session.setDefault('boGeoAddress',"Rabenu Yeruham Street, Tel Aviv-Yafo, Israel");
	Session.setDefault('boGeoCoordinates',null);
/*//////////////////////////////
     LOCAL FUNCTIONS
/////////////////////////////*/
	var setModalData = function(title,content,button,color,action){
		Session.set('showBoModal',true);
		Session.set('boModalTitle',title);
		Session.set('boModalContent',content);
		Session.set('boModalButton',button);
		Session.set('boModalButtonColor',color);
		Session.set('boModalAction',action);
	}

	var setAlertData = function(text){
		Session.set('showBoAlert',true);
		Session.set('boAlertText',text);
	}

	var deleteBranch = function(branchId){
		var queues = Queues.find({branchId:branchId}).fetch();
		for(var i = 0; i < queues.length; i++)
			deleteQueue(queues[i]._id);
		Branches.remove({_id:Session.get('branchId')});
	}
	var deleteQueue = function(queueId){
		var tickets = Tickets.find({queueId:queueId}).fetch();
		for(var i = 0; i < tickets.length; i++)
			Tickets.remove({_id:tickets[i]._id});
		Queues.remove({_id:queueId});
	}

	var addOrEditBranch = function(tmpl,action){
		var name = tmpl.find('.branch-name').value;
		var openingHours = tmpl.find('.branch-hours').value;
		var branchInfo = tmpl.find('.branch-info').value;
		var active = (tmpl.find('.branch-active').value == "true");
		var password = tmpl.find('.branch-password').value;
		var website = tmpl.find('.branch-website').value;
		console.log(Session.get("boGeoCoordinates"));
		if(name && password){
			if(action == 'add')
			{
				Branches.insert(
					{name:name,password:password,openingHours:openingHours,branchInfo:branchInfo,
						address:Session.get("boGeoAddress"),location:Session.get("boGeoCoordinates"),
						active:active, website:website});
			}
			if(action == 'edit')
				Branches.update({ _id:Session.get('branchId') },
					{$set:{name:name,password:password,openingHours:openingHours,branchInfo:branchInfo,
						address:Session.get("boGeoAddress"),location:Session.get("boGeoCoordinates"),
						active:active, website:website}});
			return true;	
		}
		else if(!name)
		{
			$('.branch-name').addClass('data-missing');
			setAlertData('Please give branch a name');
		}
		else{
			$('.branch-password').addClass('data-missing');
			setAlertData('Please set a password that will be used for kiosk and for realtime screen');
		}
		return false;
	}

	var validateEmail = function(email) {
    	var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    	return re.test(email);
	}

	var closeModal = function(){
		Session.set('showBoModal',false);
		Session.set('showBoAddBranch',false);
		Session.set('showBoAddQueue',false);
		Session.set("showBoAddUser",false);
		Session.set("showBoChangeUserRole",false);
		Session.set("showBoQueuePrefix",false);
		Session.set("userSearchString",null);
		Session.set("showBoMyProfile",false);
		Session.set('showBoChangeClerkStation',false);
	}
/*//////////////////////////////
     STARTUP
/////////////////////////////*/

	Meteor.startup(function() {  
	  GoogleMaps.load({
	  	libraries: 'places',
	  	key:'AIzaSyA6z6Tz5yDJOPlQKs3QUL9u3u0OggOG2SQ'
	  });
	});

	Template.boMap.rendered = function () {
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
		if(Session.get('branchId') && Meteor.user()){
			var user = Branches.find({_id:Session.get('branchId'),
										users:{$elemMatch:{userId:Meteor.user()._id,role:{$in:['Admin','Manager']}}}}).fetch();
			if(user.length > 0) return true;
		}
		return false;
	});
	Template.registerHelper("userIsAdmin", function () {
		if(Session.get('branchId') && Meteor.user()){
			var user = Branches.find({_id:Session.get('branchId'),users:{$elemMatch:{userId:Meteor.user()._id,role:{$in:['Admin']}}}}).fetch();
			if(user.length > 0) return true;
		}	
		return false;
	});
	Template.registerHelper("queueName", function () {
		var queue = Queues.findOne({_id:Session.get('queueId')});
		if(queue)
			return queue.name;
		return '';
	});

	Template.registerHelper('showBoModal',function(){
			return Session.get('showBoModal');
	});
	Template.registerHelper('isKiosk',function(){
		if(Meteor.user().profile.branchId)	
			return true;
		return false;
	});

	Template.registerHelper('showBoAlert',function(){
			return Session.get('showBoAlert');
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

	Template.registerHelper('queue',function(){
		if(Session.get('queueId'))
			return  Queues.findOne({_id:Session.get('queueId')});
		return {};
	});

	Template.registerHelper('user',function(){
		if(Session.get('userId'))
			return  boUsersInBranch.findOne({_id:Session.get('queueId')});
		return {};
	});

	Template.registerHelper('selected',function(type,value){
		if(value == type)
		{
			return 'selected';
		}
		return '';
	});

	Template.registerHelper('ticketCode',function(){
		if(Session.get('ticket'))
		{
			var phoneCode = Session.get('ticket').phone;
			if(phoneCode)
				return phoneCode.substr(phoneCode.length - 5);;
		}
		return 0;
	});

	Template.registerHelper('clerkStationNumber',function(){
			if(!Session.get('clerkStationNumber')){
				var users = Branches.findOne({_id:Session.get('branchId')}).users;
				for(var i = 0; i < users.length; i++){
					if(users[i].userId == Meteor.user()._id){
						Session.set('clerkStationNumber',users[i].station);
					}
				}
			}
			return Session.get('clerkStationNumber');
		});


/*//////////////////////////////
     MODAL
/////////////////////////////*/
	Template.boModal.events({
		'click .cancel':function(evt,tmpl){
			closeModal();
		},
		'click .save-remove-queue':function(evt,tmpl){
			closeModal();			
			deleteQueue(Session.get('queueId'));
		},
		'click .save-unpublic':function(evt,tmpl){
			closeModal();
			Queues.update({ _id:Session.get('queueId') },{ $set: {showToClerk:false}});
		},
		'click .save-public':function(evt,tmpl){
			closeModal();
			Queues.update({ _id:Session.get('queueId') },{ $set: {showToClerk:true}});
		},
		'click .save-active':function(evt,tmpl){
			closeModal();
			Queues.update({ _id:Session.get('queueId')},{ $set: {active:true}});
		},	
		'click .save-unactive':function(evt,tmpl){
			closeModal();
			Queues.update({ _id:Session.get('queueId')},{ $set: {active:false}});
		},
		'click .save-add-branch':function(evt,tmpl){
			if(addOrEditBranch(tmpl,'add'))
				closeModal();	
		},
		'click .save-edit-branch':function(evt,tmpl){
			if(addOrEditBranch(tmpl,'edit'))
				closeModal();
		},
		'click .save-delete-branch':function(evt,tmpl){
			closeModal();
			deleteBranch(Session.get('branchId'))
		},
		'click .save-add-queue':function(evt,tmpl){
			var name = tmpl.find('.queue-name').value;
			var active = (tmpl.find('.queue-active').value == 'true');
			var showToClerk = !(tmpl.find('.queue-permission').checked);
			var prefix = tmpl.find('.queue-prefix').value;
			if(name){
				if(!prefix) prefix = '';
				Queues.insert({name:name,showToClerk:showToClerk,active:active,prefix:prefix,branchId:Session.get('branchId')});
				closeModal();
			}
			else
			{
				$('.queue-name').addClass('data-missing');
				setAlertData('Please give queue a name');
			}
		},

		'click .save-reset-tickets':function(evt,tmpl){
			closeModal();
			Meteor.call('boResetTicketsCount',Session.get('queueId'));
		},
		'click .save-change-prefix':function(evt,tmpl){
			closeModal();
			Queues.update({ _id:Session.get('queueId')},{ $set: {prefix:tmpl.find('.queue-prefix-input').value}});
		},
		'click .save-change-role':function(evt,tmpl){
			closeModal();
			var role = tmpl.find('.user-role-input').value
			var branch = Branches.findOne({_id:Session.get('branchId')});
			var numOfAdmins = 0;
			for(i = 0; i < branch.users.length; i++)
			{
				if(branch.users[i].role == 'Admin')
					numOfAdmins++;
			}
			for(var i = 0; i < branch.users.length; i++){
				if(branch.users[i].userId == Session.get('userId')) {
					if(branch.users[i].role != 'Admin' || numOfAdmins > 2){
						branch.users[i].role = role;
						Branches.update({_id:Session.get('branchId')},{$set: {users:branch.users } });
						i = branch.users.length;
					}
					else{
						i = branch.users.length;
						setModalData(
							'Change role',
							'Last Admin in branch can not be changed',
							'','','none');
					}
				}
			}

		},
		'click .save-user-remove':function(){
			closeModal();
			var users = Branches.findOne({_id:Session.get('branchId')}).users;
			var newUsers = [];
			for(var i =0; i < users.length; i++){
				if(users[i].userId != Session.get('userId'))
					newUsers.push(users[i]);				
			}
			Branches.update({_id:Session.get('branchId')},{$set:{users:newUsers}});		
		},
		'click .save-my-user-profile':function(evt,tmpl){
	
			var name = tmpl.find('.my-user-name').value;
			var oldPassword = tmpl.find('.my-user-old-password').value;
			var newPassword = tmpl.find('.my-user-new-password').value;
			if(newPassword){
				Accounts.changePassword(oldPassword, newPassword, function(err, result) {
					if (err)
						setAlertData('Old password not match');
					else{
						Meteor.users.update({_id: Meteor.user()._id}, {$set:{profile:{name:name}}});
	      				closeModal();
					}
			 	});
			}
			 else{
				Meteor.users.update({_id: Meteor.user()._id}, {$set:{profile:{name:name}}});
	      		closeModal();
			 }	
			
		},
		'click .save-change-clerk-station':function(evt,tmpl){
			closeModal();
			var users = Branches.findOne({_id:Session.get('branchId')}).users;
			var newUsers = [];
			for(var i = 0; i < users.length;i++){
				if(users[i].userId == Meteor.user()._id){
					users[i].station = tmpl.find('.clerk-station-input').value;
					newUsers.push(users[i]);
					Session.set('clerkStationNumber',users[i].station);
				}
				else{
					newUsers.push(users[i]);
				}
			}
			Branches.update({_id:Session.get('branchId')},{$set:{users:newUsers}});
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
		},
		showBoQueuePrefix:function(){
			return Session.get('showBoQueuePrefix');
		},
		showBoAddUser:function(){
			return Session.get('showBoAddUser');
		},
		showBoChangeUserRole:function(){
			return Session.get('showBoChangeUserRole');
		},
		showBoMyProfile:function(){
			return Session.get('showBoMyProfile');
		},
		showBoChangeClerkStation:function(){
			return Session.get('showBoChangeClerkStation');
		},
		submitButton:function(action){
			return (action != 'none');
		}

	});

/*//////////////////////////////
     ALERT
/////////////////////////////*/
	Template.boAlert.helpers({
		boAlertText:function(){
			return Session.get('boAlertText');
		},
	});

	Template.boAlert.events({
		'click .close-alert':function(){
			Session.set('showBoAlert',false)
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
			Session.set('branchId',null)
			setModalData(
				'Create new branch',
				'',
				'Save','info','add-branch');
		},

		'click .branchItem':function(evt,tmpl){
			Session.set('branchId',$(evt.target).closest('div').data('id'));
			Session.set('queueId',null);
			Session.set('showBoWorkStation',false);
			Session.set('showBoAdditionalDetails',false);
			Session.set('showBoQueueList',true);
			$('.nav-tabs a[href="#queues"]').tab('show');
			Meteor.subscribe("Queues",Session.get("branchId"));
		},
		'keyup input.search-branch': function (evt) {
	        Session.set("branchSearchString", evt.currentTarget.value);
	    }, 
	});

	Template.boBranchItem.helpers({
		userRole:function(branchId){
			var users = Branches.findOne({_id:branchId}).users;
			if(users){
				for(var i=0; i < users.length; i++){
					if(users[i].userId == Meteor.user()._id)
						return users[i].role;
				}
			}

		}
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
			setModalData(
				'Edit branch',
				'',
				'Save','info','edit-branch');
		},
		'click .delete-branch':function(){
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
				return Queues.find({name:new RegExp(searchString),branchId:Session.get('branchId')}).fetch();
	    	else
				return Queues.find({branchId:Session.get('branchId')}).fetch();
	    	
		},
	});

	Template.boBranchQueues.events({
		'click .add-queue' : function(evt,tmpl){
	    	Session.set("showBoAddQueue",true);
	    	Session.set('queueId',null);
	    	setModalData(
				'Add new queue',
				'',
				'Save','info','add-queue');
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
			Session.set('queueId',this._id);
			Session.set('showBoWorkStation',true);
			Session.set('showBoQueueList',false);
			var currTicket = Tickets.findOne({queueId:this._id, userId:Meteor.user()._id, status:"Getting Service"});
			if(currTicket){
				Session.set('ticket',currTicket);
			}
			else if(Session.get('ticket'))
				if(Session.get('queueId') != Session.get('ticket').queueId)	
					Session.set('ticket',null);
		},
		'click .active-queue':function(evt,tmpl){
			Session.set('queueId',this._id);				
			var queueName = Queues.findOne({_id:this._id}).name;
			setModalData(
				'Close '+queueName,
				'Set '+ queueName+' to closed',
				'Save','info','unactive');
		},

		'click .unactive-queue':function(evt,tmpl){
			Session.set('queueId',this._id);
			Session.set('showBoModal',true);

			var queueName = Queues.findOne({_id:this._id}).name;
			setModalData(
				'Open '+queueName,
				'Set '+ queueName+' to open',
				'Save','info','active');
		},				
		'click .public-queue':function(evt,tmpl){
			Session.set('queueId',this._id);
			var queueName = Queues.findOne({_id:this._id}).name;
			setModalData(
				'Change '+queueName+' access privileges',
				'Set '+ queueName+' be visible only by managers',
				'Save','info','unpublic');
		},		
		'click .unpublic-queue':function(evt,tmpl){
			Session.set('queueId',this._id);
			var queueName = Queues.findOne({_id:this._id}).name;
			setModalData(
				'Change '+queueName+' access privileges',
				'Set '+ queueName+' be visible to all',
				'Save','info','public');
		},				
		'click .add-details-to-queue':function(evt,tmpl){
			Session.set('showBoAdditionalDetails',true);
			Session.set('queueId',this._id);
			Session.set('showBoQueueList',false);
		},
		'click .remove-queue':function(evt,tmpl){
			Session.set('queueId',this._id);
			var queueName = Queues.findOne({_id:this._id}).name;
			setModalData(
				'Delete queue '+queueName,
				'Please confirm deletion of '+ queueName,
				'Delete','danger','remove-queue');
		},
		'click .queue-statistics':function(evt,tmpl){
			Session.set('queueId',this._id);
			Session.set('showBoQueueStatistics',true);
			Session.set('showBoQueueList',false);
		},

		'click .queue-reset-ticket-count' :function(evt,tmpl){
			Session.set('queueId',this._id);
			var openTickets = Tickets.find({queueId:this.id, status:'Waiting'}).count();
			var queue = Queues.findOne({_id:this._id});
			var ticketsInService = Tickets.find({queueId:this.id,status:'Getting Service',isValid:true}).fetch();
			if(openTickets == 0 && !queue.active && ticketsInService.length == 0){
			setModalData(
				'Reset tickets count',
				'Reset tickets count for queue '+queue.name,
				'Reset','info','reset-tickets');
			}
			else{
			setModalData(
				'Reset tickets count',
				'You cannot reset counter while clients in line or getting service, or when the queue is open',
				'','','none');
			}
		},
		'click .queue-prefix' :function(evt,tmpl){
			Session.set('queueId',this._id);
			var queueName = Queues.findOne({_id:this._id}).name;
			Session.set('showBoQueuePrefix',true);
			setModalData(
				'Change queue pefix',
				'',
				'Change','info','change-prefix');
		},
	});

	Template.boQueueItem.helpers({
		queueIsActive:function(queueId){
			return this.active;
		},
		queueIsPublic:function(queueId){
			return this.showToClerk;
		},
		showClientsInLine:function(queueId){
			return (Tickets.find({queueId:this._id,status:'Waiting'}).count() > 0);
		},
		showClientsInService:function(queueId){
			var ticketsInService = Tickets.find({queueId:this._id,status:'Getting Service',isValid:true}).fetch(); 
			return (ticketsInService.length > 0);
		},
		clientsInLine:function(queueId){
			return Tickets.find({queueId:this._id,status:'Waiting'}).count();
		},
		clientsInService:function(queueId){
			var ticketsInService = Tickets.find({queueId:this._id,status:'Getting Service',isValid:true}).fetch(); 
			return ticketsInService.length;
		},
		managerOrPublic:function(queueId){
			if(this.showToClerk)
				return true;
			else{
				var user = Branches.findOne({_id:Session.get('branchId'),users:{$elemMatch:{userId:Meteor.user()._id,role:{$in:['Admin','Manager']}}}});
				if(user)
					return true;
			}	
			return false;
		}

	});

/*//////////////////////////////
     WORKSTATION
/////////////////////////////*/
	Template.boQueueWorkStation.helpers({
		ticket: function(){
			return Session.get("ticket");
		},
		nextTicket: function(){
			if(Session.get('queueId')) {
				var openTickets = Tickets.find({queueId:Session.get('queueId'), status:'Waiting'}).count();
				if (openTickets > 0) {
					return Queues.findOne({_id: Session.get('queueId')}).currentSeq + 1;
				}
			}
			return '--';
		},
		openTickets: function(){
			if(Session.get('queueId')) {
				var count = Tickets.find({queueId:Session.get('queueId'), status:'Waiting'}).count();
				console.log('count is ' + count);
				return count;
			//	return Queues.findOne({_id: Session.get('queueId')}).openTickets;
			}
		},
		disableNextTicket: function(){
			if(Session.get('queueId')) {
				var count = Tickets.find({queueId:Session.get('queueId'), status:'Waiting'}).count();
				return count<=0;
			}
		}
	});

	Template.boQueueWorkStation.events({
		'click .next-ticket':function(evt,tmpl){
			var openTickets = Tickets.find({queueId:Session.get('queueId'), status:'Waiting'}).count();
			//var queue = Queues.findOne({_id:Session.get('queueId')});
			
			if(openTickets > 0){
				Meteor.call('boNextTicket',Session.get('queueId'),function(err, data) {Session.set('ticket', data)});
			}
		},
		'click .change-clerk-station':function(){	
			Session.set('showBoChangeClerkStation',true);
			setModalData(
				'Change station',
				'',
				'Save','info','change-clerk-station');
		},
	});

	Template.boTicketDetails.helpers({
		currentTicket: function(){
			if(Session.get('ticket'))
			{
				prefix = Queues.findOne({_id:Session.get('queueId')}).prefix;
				return prefix + Session.get('ticket').sequence;
			}
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
		userList: function () {
			var searchString = Session.get("userSearchString");
			if(searchString)
				return Branches.findOne({_id:Session.get('branchId')})
						.users.filter(function(u){return u.email.toLowerCase().indexOf(searchString.toLowerCase()) != -1; });
			else
				return Branches.findOne({_id:Session.get('branchId')}).users;
		},
	});	

	Template.boBranchUsers.events({
		'keyup input.search-user': function (evt) {
	        Session.set("userSearchString", (evt.currentTarget.value));
	    }, 
	    'click .add-user' : function(evt,tmpl){
	    	Session.set("showBoAddUser",true);
	    	setModalData(
				'Add new user',
				'',
				'','','none');
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
		'click .user-add' :function(evt,tmpl){
			var u = boUsersByEmail.findOne({_id:this._id});
	    	if(u){
		    	Branches.update({ _id:Session.get('branchId') },{ $push: {users: { userId:u._id, role:'Clerk', email:u.email, name:u.name, station:0}}});
				Session.set('userId',null);
				Session.set("showBoAddUser",false);
				Session.set("showBoModal",false);
				Session.set("userSearchString",null);
				Tracker.autorun(function () {
				  	Meteor.subscribe("boUsersByEmail", Session.get("userSearchString"),Session.get("branchId"));
				});
			}
		},
		'keyup input.search-new-user': function (evt) {
	        Session.set("userSearchString", (evt.currentTarget.value));
	    }, 
	});

	Template.boUserItem.events({
		'click .user-change-role':function(evt,tmpl){
			Session.set('userId',this.userId);
			Session.set('showBoModal',true);
			Session.set('showBoChangeUserRole',true);
			var userName = Meteor.users.findOne({_id:this.userId}).profile.name;
			setModalData(
				'Change role of '+userName,
				'',
				'Change','info','change-role');
		},
		'click .user-remove': function(){
			Session.set('userId',this.userId);
			Session.set('showBoModal',false);
			var branchUsers = Branches.findOne({_id:Session.get('branchId')}).users;
			var userName = Meteor.users.findOne({_id:this.userId}).profile.name;
			if(branchUsers.length > 1){
				setModalData(
					'Remove user '+userName,
					'Confirm removing '+userName,
					'Remove','danger','user-remove');
			}
			else{
				setModalData(
					'Remove user '+userName,
					'Last user in branch can not be deleted',
					'','','none');
			}	
		},
	});


/*//////////////////////////////
     LAYOUT
/////////////////////////////*/
	Template.boLayout.events({
		'click .logout':function(event,tmpl){
			event.preventDefault();
			Meteor.logout();
		},

		'click .my-user-profile':function(evt,tmpl){
			Session.set("showBoMyProfile",true);
	    	setModalData(
				'My details',
				'',
				'Save','info','my-user-profile');
		},
	});

	Template.boLayout.helpers({
		getLogoText:function(){
			return Session.get('logotext');
		}
	});

/*//////////////////////////////
     LOGIN
/////////////////////////////*/	
	Template.boLogin.helpers({
		showBoLoginForm: function(){
			return Session.get('showBoLoginForm');
		},
		showBoSignUpForm: function(){
			return Session.get('showBoSignUpForm');
		},
	});


	Template.boLoginForm.events({
		'click .user-bo-login':function(event,tmpl){
			event.preventDefault();
			var email = tmpl.find('.login-email').value.toLowerCase();
			var password = tmpl.find('.login-password').value;


			if(!email){
				 $('.login-email').addClass('data-missing');
				 if(!email)
				 	setAlertData('Please fill in your E-mail address');
			}
			else if(!password){
				$('.login-password').addClass('data-missing');
				setAlertData('Please fill in your password');
			} 
			else{
				Meteor.loginWithPassword(email, password, function(error) {
	        		if (Meteor.user()){
	        			Session.set('branchId',null); 
	        			Session.set('queueId',null); 

	            	//	Router.go('/');
	            	}
		        	else 
		        		setAlertData("There was an error logging in: " + error.reason);
		       		return;
		       	});
			}

		},

		'click .user-open-signup':function(event,tmpl){
			Session.set('showBoLoginForm',false);
			Session.set('showBoSignUpForm',true);
		},

		'click input':function(evt,tmpl){
			$('input').removeClass('data-missing');
			Session.set('showBoAlert',false);
		}
	});

	Template.boSignupForm.events({
		'click .user-open-login':function(event,tmpl){
			Session.set('showBoLoginForm',true);
			Session.set('showBoSignUpForm',false);
		},
		'click input':function(evt,tmpl){
			$('input').removeClass('data-missing');
			Session.set('showBoAlert',false);
		},

		'click .user-bo-signup':function(event,tmpl){
			event.preventDefault();
			var email = tmpl.find('.signup-email').value.toLowerCase();
			var password = tmpl.find('.signup-password').value;
			var name = tmpl.find('.signup-name').value;
			if(!email || !validateEmail(email)){
				 $('.signup-email').addClass('data-missing');
				 if(!email)
				 	setAlertData('Please fill in your E-mail address');
				 else if(!validateEmail(email))
				 	setAlertData('E-mail you have entered not valid email address');
			}
			else if(!password){
				$('.signup-password').addClass('data-missing');
				setAlertData('Please fill in your password');
			}
			else if(!name){
				$('.signup-name').addClass('data-missing');
				setAlertData('Please fill in your name');
			}
			else{
				
				var userData = {
					email:email,
					password:password,
					profile: {name:name},
				};

				Accounts.createUser(userData, function(error) {
	        		if (Meteor.user()) {
	            		Session.set('showBoLoginForm',true);
						Session.set('showBoSignUpForm',false);
			//			Router.go('/');
					}
		        	else 
		        		setAlertData("There was an error logging in: " + error.reason);
		       		return;
		       	});
			}	
		}
	});


/*//////////////////////////////
     
/////////////////////////////*/		

}