	Meteor.publish("Tickets", function () {
	  return Tickets.find(); // everything
	});

	Tickets.allow({
  		insert: function (userId, branch) {return true;},
  		remove: function(userId, doc){return true;},
	});


	Meteor.methods({
		boDoneTicket:function(ticket,comment){
			boChangeTicketStatus(ticket,"Done",this.userId, comment);
		},

		boSkipTicket:function(ticket,comment){
			boChangeTicketStatus(ticket,"Skiped",this.userId, comment);
		}


	});



	boChangeTicketStatus = function (ticket,status,userid,comment){
		return Tickets.findAndModify({
			query: { _id: ticket._id },
			update: { $set: {status: status, userid:userid, comment:comment}},
			new: true
		});
	}




