if(Meteor.isCordova) {

	Session.setDefault('ismain', true);
	Session.setDefault('lastClickedTicket', undefined);
	Session.setDefault('optionalQueues', undefined);
	Session.setDefault('optionalBranches', undefined);
	Session.setDefault('additionalDetails', undefined);
	Session.setDefault('branchid', undefined);
	Session.setDefault('phoneid', undefined);
	Session.setDefault('isInQueues', undefined);
	Session.setDefault('estimatedWaitTime', undefined);

// --------------Home---------------------

	Template.appHome.helpers({
		ismain: function(){
			return Session.get("ismain");
		}
	});

// --------------Main-----------------------

	Template.appMainContent.events = {
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

		'click .cancel':function(){
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

	Template.appQueueContent.helpers({
		queueitem: function() {
			 var relevantQueueIds = Tickets.find({phone: Session.get('phoneid')}, { queueId: 1, _id:0}).fetch();
			 var converted = relevantQueueIds.map(function(item) { return item.queueId; });

			return Queues.find({_id: { $in: converted }});
		},
		ticketItem: function() {
			return Tickets.findOne({phone: Session.get('phoneid'), queueId:this._id});
		},
		turnStatus: function(currentSeq) {

			if (this.sequence !== '-1') {
				if (this.sequence === currentSeq && this.status === 'Getting Service') {
					return 'panel panel-success';
				} else {
					if (this.sequence < currentSeq || this.status === 'Skipped') {
						return 'panel panel-danger';
					} else {
						return 'panel panel-default';
					}
				}
			}
		},
		branchName: function() {
			var branchName = Branches.findOne({_id:this.branchId}, { name: 1, _id: 0});

			if (branchName === undefined) {
				return '-1';
			}

			return branchName.name;
		}
	});

	Template.appQueueContent.events({
		'click .leave' : leaveQueue,
		'click .postpone' : postponeTurn,
		'click .rejoin' : rejoinQueue,
		'click .nojoin' : invalidateTurn,
		'click .panel-heading': function (){
			Meteor.call('getEstimatedTime', this.queueId, function (err, response) {
				if (!err) {
					Session.set('estimatedWaitTime', response.toFixed(2));
					createCarousel($(".owl-carousel"));
				}
			});
		}
	});

	Template.appQueueContent.rendered = function() {
		var _this = this;
		this.autorun(function(c) {
			if (QueuesSub.ready() && Tickets.find().count > 0) {
				createCarousel(_this.$(".owl-carousel"));
			}
		});
	}

	function createCarousel (owl) {
		owl.owlCarousel({
			navigation : true,
			slideSpeed : 300,
			paginationSpeed : 400,
			items : 1,
			itemsDesktop : false,
			itemsDesktopSmall : false,
			itemsTablet : false,
			itemsMobile : true,
			responsiveClass: true
		});
	}

	Template.appShowQueueInfo.helpers({
		isMissed: function(status) {
			return (status === "Skipped");
		},
		isPostponeInvalid: function(queue) {
			return (this.sequence === queue.last || !queue.active);
		},
		ahead: function() {
			return BeforeTicket.find({queueId: this.queueId}).count();
		},
		estimatedWaitTime: function() {
			return Session.get('estimatedWaitTime');
		}
	});


	function leaveQueue() {
		if (this !== undefined){
			Session.set('lastClickedTicket', this);
			$('#appLeaveQueueModal').removeClass('notvisible');
		}
	}

	function postponeTurn() {
		if (this !== undefined){
			var thisTicket = this;

			Meteor.call('getEstimatedTime', this.queueId, function(err, response) {
				if (err) {
					alert('Operation failed. Please try again.');
				} else {
					Session.set('lastClickedTicket', thisTicket);
					Session.set('estimatedWaitTime', response);
					$('#appPostponeQueueModal').removeClass('notvisible');
				}
			});
		}
	}

	function rejoinQueue() {
		Meteor.call('rejoinQueue', this);
	}

	function invalidateTurn() {
		Meteor.call('invalidateTurn', this._id);
	}

// --------------Queues - Confirm modals---------------------

	Template.appLeaveQueueConfirm.events({
		'click .save':function(evt,tmpl){
			Meteor.call('removeUserFromQueue', Session.get('lastClickedTicket')._id, function(err, response) {
				if (err) {
					alert('Operation failed. Please try again.');
				} else {
					Session.set('lastClickedTicket', undefined);
					$('#appLeaveQueueModal').addClass('notvisible');
				}
			});
		},

		'click .cancel':function(evt,tmpl){
			Session.set('lastClickedTicket', undefined);
			$('#appLeaveQueueModal').addClass('notvisible');
		}
	});

	Template.appPostponeQueueConfirm.events({
		'click .save':function(evt,tmpl){
			Meteor.call('postponeTurn',Session.get('lastClickedTicket')._id, function(err, response) {
				if (err) {
					alert('Operation failed. Please try again.');
				} else {
					Session.set('lastClickedTicket', undefined);
					$('#appPostponeQueueModal').addClass('notvisible');
				}
			});
		},

		'click .cancel':function(){
			Session.set('lastClickedTicket', undefined);
			$('#appPostponeQueueModal').addClass('notvisible');
		}
	});

	Template.appPostponeQueueConfirm.helpers({
		'newLocation': function() {
			var lastClickedTicket = Session.get('lastClickedTicket');

			if (lastClickedTicket === undefined) {
				return 'A0';
			}

			var lastClickedQueue = Queues.findOne({_id: lastClickedTicket.queueId});
			return lastClickedQueue.prefix + (lastClickedQueue.last + 1).toString();
		},
		'newEstimatedTime': function() {
			return Session.get('estimatedWaitTime');
		}
	});

// --------------Branch Info---------------------

	Template.appShowBranchInfo.helpers({
		branchItem: function () {
			return Branches.findOne({_id: this.branchId});
		}
	});

// --------------Navbar---------------------

	Template.appLayout.events = {
		'click #newqueue': moveback,
		'click #myqueues': move
	}

	Template.appLayout.helpers({
		phoneIdLastDigits: function() {
			var phoneId = Session.get('phoneid');
			if (phoneId === undefined){
				return 0;
			}

			return phoneId.substr(phoneId.length - 5);
		}
	});

// ---------------------------------------------

	function move() {
		if (checkismain()) {
			$('#newqueueli').removeClass('active');
			$('#myqueuesli').addClass('active');
			$("#maincontent").fadeOut('slow', function() {


				Session.set("ismain", false);
				Session.set("phoneid", Session.get("phoneid"));
			});
		}
	}

	function moveback() {
		if (!checkismain()) {
			$('#newqueueli').addClass('active');
			$('#myqueuesli').removeClass('active');

			$("#queuecontent").fadeOut('slow', function() {


				Session.set("ismain", true);
			});
		}
	}

	function checkismain() {
		return Session.get("ismain");
	}

}