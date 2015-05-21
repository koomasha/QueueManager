Meteor.methods({
	getQueuesByBranch: function (branchId) {
		console.log('getQueuesByBranch: server and parameters are (' + branchId + ')');
		return Queues.find({branchId: branchId}).fetch();
	},
	getQueueAdditionalDetails: function (queueId) {
		console.log('getQueueAdditionalDetails: server and parameters are (' + queueId + ')');

		var queue = Queues.findOne(new Meteor.Collection.ObjectID(queueId));

		if (queue === undefined || queue === null) {
			console.log('no such queue');
		} else {
			return queue.additionDetails;
		}
	},
	addUserToQueue: addUser,
	removeUserFromQueue: function (phone, queueId) {
		removeUser(phone, queueId, "Left");
	},
	postponeTurn: function (phone, queueId) {
		console.log('postponeTurn: server and parameters are (' + phone + ') and (' + queueId + ')');
		// leave queue
		// join again	

		var ticket = Tickets.findOne({phone: phone, queueId: queueId.toHexString()});

		if (ticket === undefined || ticket === null) {
			console.log('no such ticket');
		} else {
			removeUser(phone, queueId, "Postponed");
			addUser(phone, queueId.toHexString(), ticket.additionalDetails);
		}
	}
}); 

function removeUser(phone, queueId, status) {
	// 1. TODO:Remove from tickets
	// 2. Add to statistics
	// 3. TODO:when the pakid clicks 'next', it should give the next AVAILABLE (not just ++)

	console.log('removeUserFromQueue: server and parameters are (' + phone + ') and (' + queueId + ')');

	var ticket = Tickets.findOne({phone: phone, queueId: queueId.toHexString()});

	if (ticket === undefined || ticket === null) {
		console.log('no such ticket');
	} else {
		console.log('removeUserFromQueue: found');
		Tickets.remove({phone: phone, queueId: queueId.toHexString()});
	}	
}

function addUser(phone, queueId, additionalDetails) {
	console.log('addUserToQueue: server and parameters are (' + phone + ') and (' + queueId + ')');

	var queue = Queues.findAndModify({
						query: { _id: queueId },
						update: { $inc: { last: 1,opentickets: 1 }},
						new: true
					});
	if (queue === undefined || queue === null) {
		console.log('no such queue');
	} else {
		console.log(queue.last);
		Tickets.insert({phone: phone, 
		sequence: queue.last, 
		queueId: queueId, 
		creationTime: Date.now(),
		status: "Waiting",
		additionalDetails: additionalDetails || {}
		});
	}

}
