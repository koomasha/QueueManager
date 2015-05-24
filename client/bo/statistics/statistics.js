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
			status:"DONE"
		});
		return 3.6;
	},
	now : function(){
		return new Date();
	},
	today : function(){
		console.log("start of day is " + moment().startOf('day'));
		return moment().startOf('day');
	},
	month : function(){
		console.log("month moment is " + moment().subtract(1, 'months'));
		return moment().subtract(1, 'months');
	},
	never: function(){
		return moment("19700101", "YYYYMMDD");
	},
	average : function(type){
		if (type === "day") {
			return boQueueStatistics.averageTicketTimes(now(), new Date());
		}
	}
})

Template.boQueueStatistics.events({
	'click .average-add' : function(evt, tmpl){

	}
})