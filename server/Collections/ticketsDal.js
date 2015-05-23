	Meteor.publish("Tickets", function (filter) {
	  return Tickets.find(filter||{}); // everything
	});

	Meteor.publishComposite("appTickets", function(phoneId) {
		return {
				find: function() {
		            return Tickets.find({phone:phoneId});
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
			boChangeTicketStatus(ticket,"Skiped",this.userId, comment);
		},
		boResetTicketsCount:function(queueId){
			Queues.update({ _id:queueId},{ $set: {last:0, currentSeq:0}});
			Tickets.update({queueId:queueId, isValid:true},{ $set: {isValid:false}});
		}


	});



	boChangeTicketStatus = function (ticket,status,userId,comment){
		return Tickets.findAndModify({
			query: { _id: ticket._id },
			update: { $set: {status: status, userId:userId, comment:comment}},
			new: true
		});
	}




