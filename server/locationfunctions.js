Meteor.methods({
    addressToLocation : function(address) {
        var geo = new GeoCoder();
        return geo.geocode(address);
    },
    bar: function () {
        // .. do other stuff ..
        return "baz";
    }
});