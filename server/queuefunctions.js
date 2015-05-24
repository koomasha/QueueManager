Meteor.methods({
	getNearBranchesByLocation: function (currentLocation) {
		console.log('getNearBranchesByLocation: server and parameters are (' + currentLocation.coords.longitude + ') and (' + currentLocation.coords.latitude + ')');

		var result = [];

		Branches.find().forEach( function(branch) {
		 	if (distance(branch.location.lng, branch.location.lat, currentLocation.coords.longitude, currentLocation.coords.latitude) <= 3000) {
		 		result.push(branch);
		 	}
		} );

		return result;
	},
	getQueuesByBranch: function (branchId) {
		console.log('getQueuesByBranch: server and parameters are (' + branchId + ')');

		return Queues.find({branchId: branchId, active: true}).fetch();
	},
	getQueueAdditionalDetails: function (queueId) {
		console.log('getQueueAdditionalDetails: server and parameters are (' + queueId + ')');

		var queue = Queues.findOne(queueId);

		if (queue === undefined || queue === null) {
			console.log('no such queue');
		} else {
			return queue.additionDetails;
		}
	},
	addUserToQueue: addUser,
	removeUserFromQueue: function (phone, queueId) {
		console.log('removeUserFromQueue: server and parameters are (' + phone + ') and (' + queueId + ')');

		var ticket = Tickets.findOne({phone: phone, queueId: queueId, status: 'Waiting'});

		if (ticket === undefined || ticket === null) {
			console.log('no such ticket');
		} else {
			console.log('removeUserFromQueue: found');

			Queues.findAndModify({
				query: { _id: queueId },
				update: { $inc: { opentickets: -1 }},
				new: true
			});

			Tickets.update({phone: phone, queueId: queueId}, { $set: { status: "Cancelled", finishedTime: Date.now() } });
		}
	},
	postponeTurn: function (phone, queueId) {
		console.log('postponeTurn: server and parameters are (' + phone + ') and (' + queueId + ')');

		var ticket = Tickets.findOne({phone: phone, queueId: queueId, status: "Waiting"});

		if (ticket === undefined || ticket === null) {
			console.log('no such ticket');
		} else {
			Tickets.update({phone: phone, queueId: queueId}, { $set: { status: "Postponed", finishedTime: Date.now() } } );
			addUser(phone, queueId, ticket.additionalDetails);
		}
	},
	isUserInQueue: function(phone, queues) {
		console.log('isUserInQueue');
		var inQueues = [];
		queues.forEach(function(queue) {
			var inQueue = new Object();
		    var ticket = Tickets.findOne({phone: phone, queueId: queue._id});
		    inQueue.queueId = queue._id;
		    inQueue.isInQueue = (!(ticket === undefined || ticket === null));
		    console.log('queueId = ' + inQueue.queueId + ' isUsrIn = ' + inQueue.isInQueue);

		    inQueues.push(inQueue);
		});
		
		return inQueues;
	},
	getEstimatedTime: function (queueId) {
		console.log('getEstimatedTime: server and parameters are (' + queueId + ')');

		lastFinished = Tickets.find({status: "Done", queueId: queueId}, { sort: {serviceEndTime: -1}, limit: 3}).fetch();

		var sum = 0;

		for(var i = 0; i < lastFinished.length; i++ ){
			console.log(i + ': serviceStartTime is: ' + lastFinished[i].serviceStartTime + ' and creationTime is: ' + lastFinished[i].creationTime);
		    sum += (lastFinished[i].serviceStartTime - lastFinished[i].creationTime);
		}

		var avgInMillis = sum / lastFinished.length;
		return (avgInMillis / 1000) / 60;
	}
});

function addUser(phone, queueId, additionalDetails) {
	console.log('addUserToQueue: server and parameters are (' + phone + ') and (' + queueId + ')');

	var queue = Queues.findAndModify({
		query: { _id: queueId },
		update: { $inc: { last: 1,openTickets: 1 }},
		new: true
	});
	if (queue === undefined || queue === null) {
		console.log('no such queue');
	} else {
		console.log(queue.last);
		Tickets.insert({phone: phone,
			sequence: queue.last,
			queueId: queueId,
			additionalDetails: additionalDetails || []
		});
	}

}

function distance(lon1, lat1, lon2, lat2) {
	var R = 6371; // Radius of the earth in km
	var dLat = (lat2-lat1).toRad();  // Javascript functions in radians
	var dLon = (lon2-lon1).toRad();
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) *
		Math.sin(dLon/2) * Math.sin(dLon/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c; // Distance in km
	var m = d * 1000; // Distance in meters
	console.log('in meters : ' + m);
	return m;
}

if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}
