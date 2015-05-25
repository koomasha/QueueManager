BranchStatistics = new Meteor.Collection("branchStatistics");

var Schemas = {};

Schemas.BranchStatistics = new SimpleSchema({
    name: {
        type: String,
        label: "Name",
        max: 100
    },
    branchId: {
        type: String,
        label: "Branch",
        max: 100
    },
    type: {
        type: String,
        label: "Type",
        allowedValues:['average','topClerk']
    }
});

BranchStatistics.attachSchema(Schemas.BranchStatistics);

QueueStatistics = new Meteor.Collection("queueStatistics");

var Schemas = {};

Schemas.QueueStatistics = new SimpleSchema({
    name: {
        type: String,
        label: "Name",
        max: 100
    },
    queueId: {
        type: String,
        label: "Queue",
        max: 100
    },
    type: {
        type: String,
        label: "Type",
        allowedValues:['average','topClerk']
    },
    fromTime: {
        type: Date,
        label: "FromTime"
    },
    toTime: {
        type: Date,
        label: "ToTime"
    }
});

QueueStatistics.attachSchema(Schemas.QueueStatistics);