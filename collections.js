//http://matteodem.github.io/meteor-easy-search/
Queues = new Meteor.Collection("queues");
Branches = new Meteor.Collection("branches");
Branches.initEasySearch('name');
Tickets = new Meteor.Collection("tickets");
/*hello world*/