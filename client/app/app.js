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

Template.appUserturn.helpers({
	ticketItem: function() {
		return Tickets.find({phone: phoneid});
	},
	queueIs: function(queueId) {
    		return this.queueId === queueId;
  	}
});

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

// --------------Navbar---------------------

Template.appLayout.events = {
	'click #newqueue': moveback,
	'click #myqueues': move
}

// ---------------------------------------------

function scanqueueqr() {
	cordova.plugins.barcodeScanner.scan(
		function (result) {
			// alert("We got a barcode\n" +
			// "Result: " + result.text + "\n" +
			// "Format: " + result.format + "\n" +
			// "Cancelled: " + result.cancelled);

			if (!result.cancelled) {
				Meteor.call('addUserToQueue', phoneid, result.text, function(err, response) {
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
