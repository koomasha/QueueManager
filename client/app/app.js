Session.setDefault('ismain', true);
var phoneid;


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


Template.appQueuecontent.helpers({
	queueitem: function() {
		var relevantQueueIds = Tickets.find({phone: phoneid}, { queueId: 1, _id:0}).fetch();
		var converted = relevantQueueIds.map(function(item) { return new Meteor.Collection.ObjectID(item.queueId); });

		return Queues.find({_id: { $in: converted }})
	}
});

Template.appQueuecontent.events({
	'click .leave' : leaveQueue,
	'click .postpone' : potponeTurn
});

function leaveQueue() {
	Modal.show('modal');
	// $('#dialog-confirm').dialog({
	// 	resizable: false,
	// 	height: 140,
	// 	modal: true,
	// 	buttons: {
	// 		"yes" : function() {
	// 			console.log('you pressed yes bitch');
	// 			$(this).dialog('close');
	// 		},
	// 		"no" : function() {
	// 			console.log('you pressed no bitch');
	// 			$(this).dialog('close');
	// 		}
	// 	}
	// });
}

function potponeTurn() {
	alert('u postpone turn now?');
}
// Template.appUserturn.helpers({
// 	ticketItem: function() {
// 		return Tickets.find({phone: phoneid});
// 	},
// 	queueIs: function(queueId) {
//     		return this.queueId === queueId;
//   	}
// });

// --------------Content---------------------

Template.appMaincontent.events = {
	'click #scangps': move,
	'click #scanqr': scanqueueqr
}

Template.appHome.helpers({
	ismain: function(){
		return Session.get("ismain");
	}
});

Handlebars.registerHelper('getSequence', function() {
	var tick = Tickets.findOne({phone:phoneid, queueId:this._id.toHexString()}, { sequence: 1, _id:0});
	return tick.sequence;
});

Handlebars.registerHelper('turnStatus', function(sequence) {
	//return 'panel panel-default';

	console.log('seq (' + sequence + ')');
	console.log('cur (' + this.current + ')');

	// TEMP
	if (sequence === this.current) {
		console.log('same');
		return 'panel panel-success';
	} else {
		console.log('not same');
		return 'panel panel-default';
	}

	// FULL 
	// if (sequence === current) {
	// 	return 'panel panel-success';	
	// } else if (current < sequence){ cannot compare yet
	// 	return 'panel panel-default';
	// } else {
	// 	// Also add a message that he missed his turn but he can restart
	// 	return 'panel panel-danger';
	// }
	
});

// --------------Navbar---------------------

Template.appLayout.events = {
	'click #newqueue': moveback,
	'click #myqueues': move
}

// ---------------------------------------------

function scanqueueqr() {
	cordova.plugins.barcodeScanner.scan(
		function (result) {
			 /*alert("We got a barcode\n" +
			 "Result: " + result.text + "\n" +
			 "Format: " + result.format + "\n" +
			 "Cancelled: " + result.cancelled);*/

			if (!result.cancelled) {
				console.log('why u no move2');
				Meteor.call('addUserToQueue', phoneid, result.text, function(err, response) {
					console.log('why u no move');
					move();
				}); 
		        	}
        		}, 
        		function (error) {
			alert("Scanning failed: " + error);
        		});
}

function move() {
	console.log("move")
	if (checkismain()) {
		$("#maincontent").fadeOut('slow', function() {
			console.log("is main set to false")
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

