Meteor.publish("Branches", function () {
	if(this.userId) {		
		return Branches.find({users:{$elemMatch:{userid:this.userId}}});
	}
});


/*
Branches.allow({
	insert: function (userId, branch) {return true;},
  update: function (userId, doc, fieldNames, modifier){return true}
});
*/

Branches.before.insert(function (userId, doc) {
  doc.createdAt = Date.now();
  doc.users = [{userid:userId,role:'Admin'}];
});



Meteor.publish("boUsersInBranch", function (branchid) {		
  var branch = Branches.findOne({users:{$elemMatch:{userid:this.userId}},_id:branchid});
  if(branch){
    var self = this;
    var branchUsers = Meteor.users.find({_id:{$in:branch.users.map(function(u) {return u.userid;})}}).fetch();
        _.each(branchUsers,function(u) {
         self.added('boUsersInBranch', u._id, {_id:u._id,email:u.emails[0].address});
      });
    self.ready();
  }
});

Meteor.publish("boUsersByEmail", function (email,branchid) {   
    var branch = Branches.findOne({users:{$elemMatch:{userid:this.userId}},_id:branchid});
    if(branch){
      var options = {};
      options.limit = 5;
      var self = this;
      var allusers = Meteor.users.find({emails:{$elemMatch:{address:new RegExp(email)}},_id:{$nin:branch.users.map(function(u) {return u.userid;})}},options).fetch();
          _.each(allusers,function(u) {
           self.added('boUsersByEmail', u._id, {_id:u._id,email:u.emails[0].address});
        });
      self.ready();
    }
});

Meteor.methods({
    boSaveNewBranch:function(name,location,active){
      Branches.insert({name:name,location:location,active:active});
    },

    boAddUserToBranch:function(branchid,userid,role){
      Branches.update({ _id:branchid },{ $push: {users: { userid:userid, role:role }}});
    }
});