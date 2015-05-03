var queueCounter = 0; // Save to DB

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
	
		console.log('server');
		Tickets.insert({index:'c' + queueCounter, name:queueId, userlocation: '12A', currentlocation: '45B'});
		queueCounter++;
	}
	}); 