Meteor.publish("Queues", function (branchid) {
	if(this.userId) {		
		return Queues.find({branchid:branchid});
	}
});


/*
Queues.allow({
  insert: function (userId, branch) {return true;},
  update: function (userId, doc, fieldNames, modifier){return true},
});
*/


Queues.before.insert(function (userId, doc) {
  doc.createdAt = Date.now();
  doc.last = 0;
  doc.currentSec = 0;
  doc.opentickets = 0;
});

Meteor.methods({
	boNextTicket:function(queueId){
		var queue = Queues.findAndModify({
			query: { _id: queueId },
			update: { $inc: { currentSec: 1,opentickets: -1 }},
			new: true
		});
		var ticket = Tickets.findOne({queueId:queueId,sequence:queue.currentSec,status:'Waiting'});
		return boChangeTicketStatus(ticket,"Getting Service",this.userId,'');
	},
	boSaveNewQueue:function(name,showtoclerk,active,prefix,branchid){
		Queues.insert({name:name,showtoclerk:showtoclerk,active:active,prefix:prefix,branchid:branchid});
	},

});

