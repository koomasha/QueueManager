if(!Meteor.isCordova)
{
	
	//---------- GLOBAL CODE --------------
	Template.registerHelper('feEquals', function (a, b) {
      return a === b;
    });

    Template.registerHelper('feQueueIsOpen', function (id) {
      return Queues.findOne({_id:id}).active;
    });


	//----------- FE ONLY CODE ------------
	
	//$( "#feNext" ).toggle( "pulsate" );
	var feNextTicketArr = [];
	var dingdong = new Audio('bell.mp3')

	Session.setDefault('feShow','feMaster'); //feMaster feDash
	Session.setDefault('feCurQueueId',null);
	Session.setDefault('feNextTicket',null);

	Template.registerHelper('feShow', function () {
      return Session.get('feShow');
    });

    Template.registerHelper('feNextTicket', function () {
      return Session.get('feNextTicket');
    });

    Template.registerHelper('feCurQueueId', function () {
      return Session.get('feCurQueueId');
    });
    Template.registerHelper('feAddIndex', function (all) {
	    return _.map(all, function(val, index) {
	    	  val.index = index;
	        return val;
	    });
	});

    Template.feMain.helpers({Branch:function(){return Branches.findOne({_id:Session.get('branchId')});}});
	Template.feMain.onRendered(function(){
    	if(Meteor.user().profile.branchId)
		{
			var branchId = Meteor.user().profile.branchId;
			Session.set('branchId',branchId);
			var getNewTickets = true; 

			Meteor.setInterval(ShowNextTicket, 1000);
			Tickets.find({status:'Getting Service'}).observeChanges({
			    added: function(id, doc) {
			      if (getNewTickets) {
			      	var q = Queues.findOne(doc.queueId);
			      	if(q){
				      	var queueName = q.name;
				      	if(q.prefix) queueName = q.prefix + ' - ' + q.name;

				      	feNextTicketArr.push({sequence : doc.sequence,name: queueName});
				      }
			      }
			    }
			  });
			
		}
    });

    Template.feQueuesStatus.rendered = function() {
	      $("#owl-demo").owlCarousel({
	      			items:3,
	      			autoplay:2000,
    				//loop:true,
    				dots:false
    			});
	};
	
    Template.feQueuesStatus.helpers({
    	CurQueues:function(){
    		 var qs = Queues.find().map(function(q){
    					q.tickets = Tickets.find({queueId:q._id}).fetch();
    					q.tService = q.tickets.filter(function(t){return t.status === 'Getting Service'; }).sort(sortTickets);
    					q.tServiceNum = q.tService.length;
    					q.tWaiting = q.tickets.filter(function(t){return t.status === 'Waiting'; }).sort(sortTickets);
    					q.tWaitingNum = q.tWaiting.length;
    					return q;
    				});
    		 return qs;
    	}
    });


    Template.feMaster.events({
    	'click #feBtnDash': function (event) {Session.set('feShow','feDash'); },
    	'click #feBtnTicket': function (event) { Session.set('feShow','feTickets'); },
    });

    Template.feMain.events({
    	'click #feBtnMain': function (event) { Session.set('feShow','feMaster'); },
    });

	Template.feTickets.helpers({
		Queues:function(){return Queues.find();}
	});
	Template.feQueue.events({
    	'click #feBtnQueue': function (event) { 
    		if(this.additionalDetails.length == 0)
    		 	addTicket(this._id,[]);
    		else
    			Session.set('feCurQueueId',this._id); 
    	},
    	'click .cancel': function (event) { Session.set('feCurQueueId',null); },
    });

	AutoForm.hooks({
		feTicketsForm: {
					    onSubmit: function (insertDoc, updateDoc, currentDoc) {
					      
					      var q = Queues.findOne(Session.get('feCurQueueId'));
					      var details = [];
					      var i=0;

					      for (var item in insertDoc) {
							   
							   details.push({name:q.additionalDetails[i].name,
							   				value:insertDoc[item]});
							   i++;
							}
					      
					      addTicket(q._id,details);
					      Session.set('feCurQueueId',null);
					      this.done();
					      return false;
					    }
					  }
					});


    Template.feQueue.helpers({
    	'QueueSchema': function () {    		
    		var schema={};
    		var i =0;
    		this.additionalDetails.forEach(function(item)
    		{
    			i++;
    			var field = {label:item.name,type: String};
    			if(item.type === 'appEmail') 
    				field.regEx = SimpleSchema.RegEx.Email;
    			if(item.type === 'appNumber' || item.type === 'appId') 
    				field.type = Number;

    			schema["parm"+ i]=field;
    		});

			return new SimpleSchema(schema);
    	},
    	queueID : function(){return this._id;}
    });
	

    Template.feNextTicket.helpers({
    	ticket:function(){return Session.get('feNextTicket');},
    });
    var sortTickets = function(a,b)
    {
    	return a.sequence - b.sequence;
    }
	var addTicket = function(queueId,details){
    	Meteor.apply('addUserToQueue',['',queueId,details],{wait:true},
      				function(err,res)
      				{
      					if(!err)
      						alert("Your ticket Number is: " + res);
      				});
	}

	
	var ShowNextTicket = function(){
		var a = Session.get('feNextTicket');
		if(!a  && feNextTicketArr.length > 0){
			Session.set('feNextTicket',feNextTicketArr.pop());
			setTimeout(function(){
				if(Session.get('feShow') === 'feDash') dingdong.play();
				for(i=0;i<3;i++) $("#feNext").fadeTo('slow', 0.5).fadeTo('slow', 1.0);
				setTimeout(function(){Session.set('feNextTicket',null);}, 5000);
			}, 200);
		}
	}
};



