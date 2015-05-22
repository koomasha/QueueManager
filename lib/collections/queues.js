Queues = new Meteor.Collection("queues");
var Schemas = {};


SimpleSchema.debug = true;

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
        type: Boolean,
        label: "Is Active",
    },
    prefix: {
        type: String,
        label: "Prefix",
        max: 5,
        optional:true
    },
    branchid: {
        type: String,
        label: "Branch",
        max: 100
    },
    last:{
        type: Number,
        label: "Last",
        optional:true
    },
    currentSec:{
        type: Number,
        label: "Sequence",
        optional:true
    },
    openTickets:{
        type: Number,
        label: "Open tickets",
        optional:true
    },
    "additionalDetails.$.name":{
        type: String,
        label: "Name", 
      
    },
    "additionalDetails.$.type": {
        type: String,
        label: "Type",
        allowedValues:['appEmail','appNumber','appText','appId','appPhone'],
        
    }
   
});

Queues.attachSchema(Schemas.Queues);
