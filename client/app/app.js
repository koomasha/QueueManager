Skip to content
This repository  
Explore
Gist
Blog
Help
@koomasha koomasha
 
 Unwatch 4
  Star 0
  Fork 0
koomasha/QueueManager
 tree: fff7f7235e  QueueManager/client/app/app.js
@SoulManStSoulManSt 19 hours ago leave queue, postpone queue, addtional details(without some validations)
2 contributors @koomasha @SoulManSt
RawBlameHistory    292 lines (237 sloc)  7.096 kb
Session.setDefault('ismain', true);
Session.setDefault('lastClickedQueue', undefined);
Session.setDefault('optionalQueues', undefined);
Session.setDefault('additionalDetails', undefined);
var phoneid;

// --------------Startup---------------------

Meteor.startup(function () {
	window.plugins.uniqueDeviceID.get(
		function (result) {
			console.log("phone id is: " + result);
	    		phoneid = result;
		}, 
		function () {
			alert("getting phone id failed ");
		}
	);
});


// --------------Main-----------------------

Template.appMaincontent.events = {
	'click #scangps': move,
	'click #scanqr': scanqueueqr
}

Template.appChooseQueue.events = {
	'click #queuesgroup a': function() {
		addUserToQueue(this);
		$('#appChooseQueueModal').addClass('notvisible');
		Session.set('optionalQueues', undefined);
	},
	'click .cancel': function() {
		Session.set('optionalQueues', undefined);
		$('#appChooseQueueModal').addClass('notvisible');
	}
}

Template.appChooseQueue.helpers({
	queueItem: function() {
		return Session.get('optionalQueues');
	}
});

Template.appAdditionalDetails.events = {
	'click .save':function(evt,tmpl){
		console.log('save additionalDetails');

		// TODO: validate fields - in validator.js - not perfect
		if (isValid()) {

			var additionalDetailsFromUser = [];

			$('.input-group').each(function() {
				var additional = new Object();
				$(this).children('id').each (function() {
					additional.name = $(this).html();
				});
				$(this).children('input').each (function() {
					additional.value = this.value;
				});
				additionalDetailsFromUser.push(additional);
			});

			Meteor.call('addUserToQueue', phoneid, Session.get('additionalDetails')._id.toHexString(), additionalDetailsFromUser, function(err, response) {
				Session.set('additionalDetails', undefined);
				$('#appAdditionalDetailsModal').addClass('notvisible');
				move();
			}); 
		}
	},

	'click .cancel':function(evt,tmpl){
		console.log('cancel additionalDetails');

		Session.set('additionalDetails', undefined);
		$('#appAdditionalDetailsModal').addClass('notvisible');
	}
}

Template.appAdditionalDetails.helpers({
	detail: function() {
		var queue = Session.get('additionalDetails');

		if (queue === undefined) {
			return undefined;
		}

		return queue.additionalDetails;
	}
});

function scanqueueqr() {
	cordova.plugins.barcodeScanner.scan(
		function (result) {
			var branchId = result.text;

			if (!result.cancelled) {

				Meteor.call('getQueuesByBranch', branchId, function(err, response) {
					console.log('response');
					if (response.length === 0) {
						$('#errorLabel').text('סניף לא נמצא');
						$('#erroralert').removeClass('notvisible');
					} else if (response.length === 1) {
						$('#erroralert').addClass('notvisible');
						addUserToQueue(response[0]);
					} else {
						$('#erroralert').addClass('notvisible');
						showAvailableQueues(response);
					}
				}); 
        	}
		}, 
		function (error) {
			alert("Scanning failed: " + error);
		});
}

function addUserToQueue(queue) {
	if (queue.additionalDetails === undefined || queue.additionalDetails === null) {
		
		Meteor.call('addUserToQueue', phoneid, queue._id.toHexString(), null, function(err, response) {
			move();
		});

	} else {
		showAdditionalDetails(queue);	
	}
}

function showAdditionalDetails(queue) {
	console.log('additional details here');
	Session.set('additionalDetails', queue);
	$('#appAdditionalDetailsModal').removeClass('notvisible');
}

function showAvailableQueues(queues) {
	Session.set('optionalQueues', queues);
	$('#appChooseQueueModal').removeClass('notvisible');
}

// --------------Queues---------------------

Template.appQueuecontent.helpers({
	queueitem: function() {
		var relevantQueueIds = Tickets.find({phone: phoneid}, { queueId: 1, _id:0}).fetch();
		var converted = relevantQueueIds.map(function(item) { return new Meteor.Collection.ObjectID(item.queueId); });

		return Queues.find({_id: { $in: converted }})
	}
});

Template.appQueuecontent.events({
	'click .leave' : leaveQueue,
	'click .postpone' : postponeTurn
});

function leaveQueue() {
	if (this !== undefined){
		console.log(this);
		Session.set('lastClickedQueue', this);
		$('#appLeaveQueueModal').removeClass('notvisible');
	}
}

function postponeTurn() {
	if (this !== undefined){
		Session.set('lastClickedQueue', this);
		$('#appPostponeQueueModal').removeClass('notvisible');	
	}
}

Template.appHome.helpers({
	ismain: function(){
		return Session.get("ismain");
	}
});

Handlebars.registerHelper('getSequence', function() {
	var tick = Tickets.findOne({phone:phoneid, queueId:this._id.toHexString()}, { sequence: 1, _id: 0});

	if (tick === undefined) {
		return '-1';
	}

	return tick.sequence;
});

Handlebars.registerHelper('turnStatus', function(sequence) {

	if (sequence !== '-1') {
		if (sequence === this.current) {
			console.log('same');
			return 'panel panel-success';
		} else {
			var sequenceNum = parseInt(sequence.match(/\d+/)[0]);
			var currentNum = parseInt(this.current.match(/\d+/)[0]);

			if (sequenceNum < currentNum) {
				return 'panel panel-danger';
			} else {
				return 'panel panel-default';
			}
		}	
	}
});

// --------------Queues - Confirm modals---------------------

Template.appLeaveQueueConfirm.events({
	'click .save':function(evt,tmpl){
		Meteor.call('removeUserFromQueue', phoneid, Session.get('lastClickedQueue')._id, function(err, response) {
			Session.set('lastClickedQueue', undefined);
			$('#appLeaveQueueModal').addClass('notvisible');
		}); 
	},

	'click .cancel':function(evt,tmpl){
		Session.set('lastClickedQueue', undefined);
		$('#appLeaveQueueModal').addClass('notvisible');
	}
});

Template.appPostponeQueueConfirm.events({
	'click .save':function(evt,tmpl){
		Meteor.call('postponeTurn', phoneid, Session.get('lastClickedQueue')._id, function(err, response) {
			Session.set('lastClickedQueue', undefined);
			$('#appPostponeQueueModal').addClass('notvisible');	
		}); 
	},

	'click .cancel':function(evt,tmpl){
		Session.set('lastClickedQueue', undefined);
		$('#appPostponeQueueModal').addClass('notvisible');
	}
});

Template.appPostponeQueueConfirm.helpers({
	'newLocation': function() {
			var lastClickedQueue = Session.get('lastClickedQueue');

			if (lastClickedQueue === undefined) {
				return '0';
			}

			var next = lastClickedQueue.last;
			var lastNum = parseInt(next.match(/\d+/)[0]) + 1;
			next = next.replace(/(\d+)/g, lastNum);

			return next;
	},
	'newEstimatedTime': function() {
		if (Session.get('lastClickedQueue') === undefined) {
				return 0;
		}

		return 1;
	}
});

// --------------Navbar---------------------

Template.appLayout.events = {
	'click #newqueue': moveback,
	'click #myqueues': move
}

// ---------------------------------------------

function move() {
	if (checkismain()) {
		$("#maincontent").fadeOut('slow', function() {
			Session.set("ismain", false);
		});  
	}
}

function moveback() {
	if (!checkismain()) {
		$("#queuecontent").fadeOut('slow', function() {
			Session.set("ismain", true);
		});  
	}
}

function checkismain() {
	return Session.get("ismain");
}
Status API Training Shop Blog About
© 2015 GitHub, Inc. Terms Privacy Security Contact
