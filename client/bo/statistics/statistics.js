/*
	GLOBAL VARIABLES TO USE (DON'T CHANGE THEM)
	------------------------------------------
		Session.get('branchId')  --curent branch id
		Session.get('queueId')   --curent queue id
		Meteor.user()            --curent user
*/

Template.boQueueStatisticsItem.onRendered(function(){
	var from = this.find('.from-time').value;
	var to = this.find('.to-time').value;
	var queueId = Session.get('queueId');
	var stattype = this.find('.stat-type').value;
	console.log("from is " + from + " and to is " + to);
	var templateInstance=this;
	if(stattype==='average') {
		Meteor.call("statisticsQueueAverageTicketTime", from, to, queueId, function (error, result) {
			templateInstance.$(".stat-result").text(result);
		});
	} else if(stattype==='topClerk'){
		Meteor.call("statisticsQueueTopClerk", from, to, queueId, function (error, result) {
			templateInstance.$(".stat-result").text(result);
		});
	} else {
		console.log("ERROR - boQueueStatisticsItem has type " + stattype);
	}
});

Template.boQueueStatistics.helpers({
	averageTicketTimes : function(from, to){
		var queue = Session.get('queueId');
		var startRange = from.getDay();
		var endRange = to;
		console.log("range from " + from + " to " + to);
		Tickets.findAll({
			createdAt:{
			$gte:startRange,
			$lt:endRange},
			queue:queue,
			status:"Done"
		});
		return 3.6;
	},
	now : function(){
		return moment().valueOf();
	},
	today : function(){
		console.log("start of day is " + moment().startOf('day'));
		return moment().startOf('day').valueOf();
	},
	month : function(){
		console.log("month moment is " + moment().subtract(1, 'months'));
		return moment().subtract(1, 'months').valueOf();
	},
	never: function(){
		return moment("19700101", "YYYYMMDD").valueOf();
	}
});

Template.boQueueStatistics.events({
	'click .test-add-tickets' : function(evt, tmpl){
		console.log("TEST - adding ticket to queue");
		for(var i=0; i<10; i++){
			var creationTime=moment().subtract(i, 'hours').valueOf();
			var serviceEndTime=moment().valueOf();
			var clerk;
			if(i%2===0){
				 clerk="Sarah";
			}else if(i%3===0){
				 clerk="Stas";
			}else{
				 clerk="Olga";
			}
			var ticket={phone:234, sequence:1, queueId:Session.get('queueId'),
				creationTime:creationTime,status:"Done",serviceEndTime:serviceEndTime,clerk:clerk};
			var update={creationTime:creationTime,serviceEndTime:serviceEndTime,status:"Done"};
			Meteor.call("testAddTicketToQueue", ticket, update, function(error,result){
				console.log("added ticket " + result + " to queue");
			});
		}
	}
});