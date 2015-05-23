sequences = new Meteor.Collection("sequences");

Meteor.publish("Branches", function () {
  if(this.userId) { 
      if(Meteor.users.find({_id:this.userId, "profile.branchId": { $exists: true }}).count() > 0)
        return  Branches.find({kioskId:this.userId});
    return Branches.find({users:{$elemMatch:{userId:this.userId}}});
  }
});



Branches.allow({
	insert: function (userId, branch) {return true;},
  update: function (userId, doc, fieldNames, modifier){return GetAllowBranches(userId,doc._id,['Admin'])},
  remove: function(userId, doc){return GetAllowBranches(userId,doc._id,['Admin']);},
});


Branches.before.insert(function (userId, doc) {
  var kioskId = null;
  var sequence = null;
  while(!kioskId) {
    sequence = sequences.findAndModify({
      query: {name: 'kioskSequence' },
      update: { $inc: { sequence: 1}},
      upsert:true,
      new: true
    }).sequence;
    kioskId  = Accounts.createUser({username:'iticket'+sequence,password:doc.password,profile:{branchId:doc._id}});
  }
  var u = Meteor.users.findOne({_id:userId});
  doc.creationTime = Date.now();
  doc.users = [{userId:userId,role:'Admin',email:u.emails[0].address,name:u.profile.name, station:0}];
  doc.kioskUsername = 'iticket'+sequence;
  doc.kioskId = kioskId;
});


GetAllowBranches = function(userId,branchId,roles)
{
    if(Branches.findOne({_id:branchId,users:{$elemMatch:{userId:userId,role:{$in:roles}}}}))
      {
      return true;
      }
    else
      return false;
}


Meteor.publish("boUsersInBranch", function (branchId) {	
  var branch = Branches.findOne({users:{$elemMatch:{userId:this.userId}},_id:branchId});
  if(branch){
    var self = this;
    
    var users = {};
    _.each(branch.users,function(u){users[u.userId] = u.role;});

    var branchUsers = Meteor.users.find({_id:{$in:branch.users.map(function(u) {return u.userId;})}}).fetch();
        _.each(branchUsers,function(u) {
         if(u.emails)
         {
            self.added('boUsersInBranch', u._id, {_id:u._id,email:u.emails[0].address,name:u.profile.name,role:users[u._id]});
         } 
      });
    self.ready();
  }
});

Meteor.publish("boUsersByEmail", function (email,branchId) {   
    var branch = Branches.findOne({users:{$elemMatch:{userId:this.userId}},_id:branchId});
    if(branch){
      var options = {};
      options.limit = 5;
      var self = this;
      var allusers = Meteor.users.find({emails:{$elemMatch:{address:new RegExp(email)}},_id:{$nin:branch.users.map(function(u) {return u.userId;})}},options).fetch();
          _.each(allusers,function(u) {
           self.added('boUsersByEmail', u._id, {_id:u._id,email:u.emails[0].address,name:u.profile.name});
        });
      self.ready();
    }
});
