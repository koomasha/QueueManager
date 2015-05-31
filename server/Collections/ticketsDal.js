	Meteor.publish("Tickets", function (filter) {
	  return Tickets.find(filter||{}); // everything
	});

	Meteor.publishComposite("appTickets", function(phoneId) {
		return {
				find: function() {
		            return Tickets.find({phone:phoneId, isValid:true, $or: [{status: 'Waiting'}, {status: 'Skipped'}, {status: 'Getting Service'}]});
		        },
		        children: [
		            {
		                find: function(ticket) {
		                	console.log("queueId:"+ticket.queueId);
		                    return Queues.find({ _id: ticket.queueId});
		                }
		            },
		            {
		                find: function(ticket) {
		                	console.log("branchId:"+ticket.branchId);
		                    return Branches.find({ _id: ticket.branchId});
		                }
		            },
		            {
		                collectionName: "BeforeTicket",
		                find: function(ticket) {
		                    return Tickets.find({ queueId: ticket.queueId,sequence: { $lt: ticket.sequence},status:'Waiting'});
		                }
		            }
		        ]
		    }
	});


	Tickets.allow({
  		insert: function (userId, branch) {return true;},
  		remove: function(userId, doc){return true;},
	});

	Tickets.before.insert(function (userId, doc) {
	  doc.creationTime = Date.now();
	  doc.status = "Waiting";
	  doc.branchId = Queues.findOne({_id:doc.queueId}).branchId;
	  doc.isValid = true;
	});


	Meteor.methods({
		boDoneTicket:function(ticket,comment){
			boChangeTicketStatus(ticket,"Done",this.userId, comment);
		},

		boSkipTicket:function(ticket,comment){
			boChangeTicketStatus(ticket,"Skipped",this.userId, comment);
		},
		boResetTicketsCount:function(queueId){
			Queues.update({ _id:queueId},{ $set: {last:0, currentSeq:0}});
			Tickets.update({queueId:queueId, isValid:true},{ $set: {isValid:false}});
		}


	});



	boChangeTicketStatus = function (ticket,status,userId,comment){
		var update = {status: status, userId:userId, comment:comment};
		if (status === 'Done' || status === 'Skipped') {
			update["serviceEndTime"] = moment().valueOf();
		} else if (status === 'Getting Service') {
			var users = Branches.findOne({_id:ticket.branchId}, {users: { $elemMatch:{userId:userId}}}).users;
			console.log("users is " + JSON.stringify(users));
			var clerkStation = users[0].station;
			console.log("clerkStation is " + JSON.stringify(clerkStation));
			update["station"] = clerkStation;
		}
		return Tickets.findAndModify({
			query: { _id: ticket._id },
			update: { $set: update},
			new: true
		});
	}




