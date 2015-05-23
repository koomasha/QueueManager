if(Meteor.isCordova) {

	Session.setDefault('ismain', true);
	Session.setDefault('lastClickedQueue', undefined);
	Session.setDefault('optionalQueues', undefined);
	Session.setDefault('optionalBranches', undefined);
	Session.setDefault('additionalDetails', undefined);
	Session.setDefault('branchid', undefined);
	Session.setDefault('phoneid', undefined);
	Session.setDefault('isInQueues', undefined);

// --------------Startup---------------------

	Meteor.startup(function () {
		window.plugins.uniqueDeviceID.get(
			function (result) {
				console.log("phone id is: " + result);
				Session.set('phoneid', result);
			},
			function () {
				alert("Operation failed. Please restart the application.");
			}
		);
	});


// --------------Main-----------------------

	Template.appMaincontent.events = {
		'click #scangps': scangps,
		'click #scanqr': scanqueueqr
	}

	Template.appChooseBranch.events = {
		'click #branchesgroup a': function() {
			getQueuesByBranch(this._id);
			$('#appChooseBranchModal').addClass('notvisible');
			Session.set('optionalBranches', undefined);
		},
		'click .cancel': function() {
			Session.set('optionalBranches', undefined);
			$('#appChooseBranchModal').addClass('notvisible');
		}
	}

	Template.appChooseBranch.helpers({
		branchItem: function() {
			return Session.get('optionalBranches');
		}
	});

	Template.appChooseQueue.events = {
		'click #queuesgroup button': function() {
			addUserToQueue(this);
			$('#appChooseQueueModal').addClass('notvisible');
			Session.set('optionalQueues', undefined);
			Session.set('isInQueues', undefined);	
		},
		'click .cancel': function() {
			Session.set('optionalQueues', undefined);
			Session.set('isInQueues', undefined);
			$('#appChooseQueueModal').addClass('notvisible');
		}
	}

	Template.appChooseQueue.helpers({
		queueItem: function() {
			return Session.get('optionalQueues');
		},
		'isInQueue': function() {
			var isInQueues = Session.get('isInQueues');
			if (isInQueues !== undefined) {
				var thisid = this._id;

				var queue = $.grep(isInQueues, function(e) { 
					return e.queueId === thisid; 
				});

				return queue[0].isInQueue;
			}
		}
	});

	Template.appAdditionalDetails.events = {
		'click .save':function(evt,tmpl){
			console.log('save additionalDetails');

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

					console.log('val: ' + additional.value);
					additionalDetailsFromUser.push(additional);
				});

				Meteor.call('addUserToQueue', Session.get('phoneid'), Session.get('additionalDetails')._id, additionalDetailsFromUser, function(err, response) {
					if (err) {
						alert('Operation failed. Please try again.');
					} else {
						Session.set('additionalDetails', undefined);
						$('#appAdditionalDetailsModal').addClass('notvisible');
						move();
					}
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

	function scangps() {
		console.log('searching..');
		$('#erroralert').addClass('notvisible');
		GPSLocation.getCurrentPosition(findnearbranches, onGpsError, { timeout: 30000 });
	}

	function onGpsError(error) {
		console.log('failed..');
		$('#errorLabel').text(error.message);
		$('#erroralert').removeClass('notvisible');
	}

	function findnearbranches(location) {
		Meteor.call('getNearBranchesByLocation', location, function(err, response) {
			if (err) {
				alert('Operation failed. Please try again.');
			} else {
				if (response.length === 0) {
					$('#errorLabel').text('Nothing was found in your area');
					$('#erroralert').removeClass('notvisible');
				} else {
					$('#erroralert').addClass('notvisible');
					showAvailableBranches(response);
				}
			}
		});
	}

	function scanqueueqr() {
		cordova.plugins.barcodeScanner.scan(
			function (result) {
				if (!result.cancelled) {
					getQueuesByBranch(result.text)
				}
			},
			function (error) {
				alert("Scanning failed: " + error);
			});
	}

	function getQueuesByBranch(branchId) {
		Meteor.call('getQueuesByBranch', branchId, function(err, response) {
			console.log('response');

			if (err) {
				alert('Operation failed. Please try again.');
			} else {
				if (response.length === 0) {
					$('#errorLabel').text('There are no active queues in this branch.');
					$('#erroralert').removeClass('notvisible');
				} else {
					$('#erroralert').addClass('notvisible');
					showAvailableQueues(response);
				}
			}
		});
	}

	function addUserToQueue(queue) {
		if (queue.additionalDetails === undefined || queue.additionalDetails === null || queue.additionalDetails.length === 0) {

			Meteor.call('addUserToQueue', Session.get('phoneid'), queue._id, null, function(err, response) {
				if (err) {
					alert('Operation failed. Please try again.');
				} else {
					move();
				}
			});

		} else {
			showAdditionalDetails(queue);
		}
	}

	function showAdditionalDetails(queue) {
		Session.set('additionalDetails', queue);
		$('#appAdditionalDetailsModal').removeClass('notvisible');
	}

	function showAvailableQueues(queues) {
		Session.set('optionalQueues', queues);

		Meteor.call('isUserInQueue', Session.get('phoneid'), queues, function(err, response) {
			if (err) {
				alert('Operation failed. Please try again.');
			} else {
				Session.set('isInQueues', response);
				$('#appChooseQueueModal').removeClass('notvisible');
			}
		});
	}

	function showAvailableBranches(branches) {
		Session.set('optionalBranches', branches);
		$('#appChooseBranchModal').removeClass('notvisible');
	}
// --------------Queues---------------------

	Template.appQueuecontent.helpers({
		queueitem: function() {
			 var relevantQueueIds = Tickets.find({phone: Session.get('phoneid')}, { queueId: 1, _id:0}).fetch();
			 var converted = relevantQueueIds.map(function(item) { return item.queueId; });

			return Queues.find({_id: { $in: converted }});
		},
		isUserLast: function(userSec) {
			return (userSec === this.last);
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
		var tick = Tickets.findOne({phone: Session.get('phoneid'), queueId:this._id}, { sequence: 1, _id: 0});

		if (tick === undefined) {
			return '-1';
		}

		return tick.sequence;
	});

	Handlebars.registerHelper('getBranchName', function() {
		var branchName = Branches.findOne({_id:this.branchid}, { name: 1, _id: 0});

		if (branchName === undefined) {
			return '-1';
		}

		return branchName.name; 
	});

	Handlebars.registerHelper('turnStatus', function(sequence) {

		if (sequence !== '-1') {
			if (sequence === this.currentSec) {
				console.log('same');
				return 'panel panel-success';
			} else {
				if (sequence < this.currentSec) {
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
			Meteor.call('removeUserFromQueue', Session.get('phoneid'), Session.get('lastClickedQueue')._id, function(err, response) {
				if (err) {
					alert('Operation failed. Please try again.');
				} else {
					Session.set('lastClickedQueue', undefined);
					$('#appLeaveQueueModal').addClass('notvisible');
				}
			});
		},

		'click .cancel':function(evt,tmpl){
			Session.set('lastClickedQueue', undefined);
			$('#appLeaveQueueModal').addClass('notvisible');
		}
	});

	Template.appPostponeQueueConfirm.events({
		'click .save':function(evt,tmpl){
			Meteor.call('postponeTurn', Session.get('phoneid'), Session.get('lastClickedQueue')._id, function(err, response) {
				if (err) {
					alert('Operation failed. Please try again.');
				} else {
					Session.set('lastClickedQueue', undefined);
					$('#appPostponeQueueModal').addClass('notvisible');
				}
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

			return lastClickedQueue.prefix + (lastClickedQueue.last + 1);
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
				Session.set("phoneid", Session.get("phoneid"));
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

}