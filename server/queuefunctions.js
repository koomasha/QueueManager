Meteor.methods({
	addUserToQueue: function (phone, queueId) {
		// 1. Check if queue exists
		// 2	 If not - return error
		// 3. Check if queue is open
		// 4. 	If not - return error
		// 5. Check if there are additional details
		// 6. ask them..
		// 5. Add user to queue, return his current location and queue current location 


		// ----------------------------
		console.log('server and parameters are (' + phone + ') and (' + queueId + ')');

		var queue = Queues.findOne(new Meteor.Collection.ObjectID(queueId));

		if (queue === undefined || queue === null) {
			console.log('cant find queue because it is ' + queue);
			// error
		} else {
			var current = queue.current;
			var next = queue.last + 1;

			Tickets.insert({phone: phone, 
					sequence: next, 
					queueId: queueId, 
					creationTime: new Date().toTimeString(),
					status: "waiting"
			});

			Queues.update(new Meteor.Collection.ObjectID(queueId), {$set: {last: next}});
		}		
	}
}); 
