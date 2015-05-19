
Branches = new Meteor.Collection("branches");

var Schemas = {};

Schemas.Branches = new SimpleSchema({
    name: {
        type: String,
        label: "Name",
        max: 100
    },
    location: {
        type: String,
        label: "Location",
        optional: true
    },
    locationLat: {
        type: String,
        label: "LocationLat",
        optional: true
    },
    locationLong: {
        type: String,
        label: "LocationLong",
        optional: true
    },
    active: {
        type: String,
        label: "Is Active",
        allowedValues:['Active','Not active']
    },
    "users.$.userid":{
    	type: String,
        label: "userid"
    },
    "users.$.role": {
    	type: String,
        label: "role",
        allowedValues:['Admin','Manager','Clerk','Kiosk']
    }
});

Branches.attachSchema(Schemas.Branches);
