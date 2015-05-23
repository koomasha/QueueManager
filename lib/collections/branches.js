
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
    "users.$.userId":{
    	type: String,
        label: "user id"
    },
    "users.$.role": {
    	type: String,
        label: "role",
        allowedValues:['Admin','Manager','Clerk','Kiosk']
    },
    "users.$.name": {
        type: String,
        label: "name",
    },
    "users.$.email": {
        type: String,
        label: "Email",
    },
    "users.$.station": {
        type: String,
        label: "Station",
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
