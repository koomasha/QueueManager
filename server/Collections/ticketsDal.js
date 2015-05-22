	Meteor.publish("Tickets", function () {
	  return Tickets.find(); // everything
	});

	Tickets.allow({
  		insert: function (userId, branch) {return true;},
  		remove: function(userId, doc){return true;},
	});

	Tickets.before.insert(function (userId, doc) {
	  doc.creationTime = Date.now();
	  doc.status = "Waiting",
	  doc.branchId = Queues.findOne({_id:doc.queueId}).branchId;
	});


	Meteor.methods({
		boDoneTicket:function(ticket,comment){
			boChangeTicketStatus(ticket,"Done",this.userId, comment);
		},

		boSkipTicket:function(ticket,comment){
			boChangeTicketStatus(ticket,"Skiped",this.userId, comment);
		}


	});



	boChangeTicketStatus = function (ticket,status,userId,comment){
		return Tickets.findAndModify({
			query: { _id: ticket._id },
			update: { $set: {status: status, userId:userId, comment:comment}},
			new: true
		});
	}




