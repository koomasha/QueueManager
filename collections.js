//http://matteodem.github.io/meteor-easy-search/
Companies = new Meteor.Collection("companies");
Queues = new Meteor.Collection("queues");
Branches = new Meteor.Collection("branches");
Tickets = new Meteor.Collection("tickets");


Branches.initEasySearch('name');
