
Branches = new Meteor.Collection("branches");

var Schemas = {};

Schemas.Branches = new SimpleSchema({
    name: {
        type: String,
        label: "Name",
        max: 100
    },
    address: {
        type: String,
        label: "Address",
    },
    active: {
        type: Boolean,
        label: "Is Active",
    },
    password:{
        type: String,
        label: "Password",
    },
    "users.$.userid":{
    	type: String,
        label: "userid"
    },
    "users.$.role": {
    	type: String,
        label: "role",
        allowedValues:['Admin','Manager','Clerk','Kiosk']
    },
    "location.lat":{
        type: Number,
        label: "Latitude",
        decimal:true
    },
    "location.lng": {
        type: Number,
        label: "Longtitude",
        decimal:true
    }
});

Branches.attachSchema(Schemas.Branches);
