Meteor.publish("Queues", function (branchid) {
	if(this.userId) {		
		return Queues.find({branchid:branchid});
	}
});



Queues.allow({
  insert: function (userId, doc) {
  	return GetAllowBranches(userId,doc.branchid,['Admin','Manager']) ;
  },
  update: function (userId, doc, fieldNames, modifier){
  	return GetAllowBranches(userId,doc.branchid,['Admin','Manager']) ;
  },
  remove: function(userId, doc){
  	return GetAllowBranches(userId,doc.branchid,['Admin','Manager']) ;
  },
});



Queues.before.insert(function (userId, doc) {
  doc.createdAt = Date.now();
  doc.last = 0;
  doc.currentSec = 0;
  doc.opentickets = 0;
  doc.additionalDetails = [];
  doc.prefix='';
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
});
