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
		Meteor.call("statisticsAverageTicketTime", from, to, "queue", queueId, function (error, result) {
			templateInstance.$(".stat-result").text(result);
		});
	} else if(stattype==='topClerk'){
		Meteor.call("statisticsTopClerk", from, to, "queue", queueId, function (error, result) {
			templateInstance.$(".stat-result").text(result);
		});
	} else {
		console.log("ERROR - boQueueStatisticsItem has type " + stattype);
	}
});

Template.boQueueStatistics.helpers({
	now : function(){
		return moment().valueOf();
	},
	today : function(){
		return moment().startOf('day').valueOf();
	},
	month : function(){
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

			var ticket={phone:234, sequence:1, queueId:Session.get('queueId'),
				creationTime:creationTime,status:"Done",serviceEndTime:serviceEndTime};
			var update={creationTime:creationTime,serviceEndTime:serviceEndTime,status:"Done"};
			Meteor.call("testAddTicketToQueue", Session.get('queueId'), update, function(error,result){
				console.log("added ticket to queue");
			});
		}
	}
});

Template.boBranchStatisticsItem.onRendered(function(){
	var from = this.find('.from-time').value;
	var to = this.find('.to-time').value;
	var branchId = Session.get('branchId');
	var stattype = this.find('.stat-type').value;
	console.log("from is " + from + " and to is " + to);
	var templateInstance=this;
	if(stattype==='average') {
		Meteor.call("statisticsAverageTicketTime", from, to, "branch", branchId, function (error, result) {
			templateInstance.$(".stat-result").text(result);
		});
	} else if(stattype==='topClerk'){
		Meteor.call("statisticsTopClerk", from, to, "branch", branchId, function (error, result) {
			templateInstance.$(".stat-result").text(result);
		});
	} else {
		console.log("ERROR - boBranchStatisticsItem has type " + stattype);
	}
});

Template.boBranchStatistics.helpers({
	now : function(){
		return moment().valueOf();
	},
	today : function(){
		return moment().startOf('day').valueOf();
	},
	month : function(){
		return moment().subtract(1, 'months').valueOf();
	},
	never: function(){
		return moment("19700101", "YYYYMMDD").valueOf();
	}
});