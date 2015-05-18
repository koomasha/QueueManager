Queues = new Meteor.Collection("queues");
var Schemas = {};

Schemas.Queues = new SimpleSchema({
    name: {
        type: String,
        label: "Name",
        max: 100
    },
    showtoclerk: {
        type: Boolean,
        label: "Clerk perrmision",
    },
    active: {
        type: String,
        label: "Is Active",
        allowedValues:['Active','Not active']
    },
    prefix: {
        type: String,
        label: "Prefix",
        max: 5
    },
    branchid: {
        type: String,
        label: "Branch",
        max: 100
    },
   
});

Queues.attachSchema(Schemas.Queues);
