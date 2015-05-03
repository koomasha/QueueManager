Session.set("ismain", true);


Template.queuecontent.helpers({
	queueitem: function() {
		return Tickets.find();
	}
});

// --------------Content---------------------

Template.content.events = {
  'click #scangps': move,
  'click #scanqr': scanqueueqr
}

Template.content.helpers({
  ismain: checkismain
});

// --------------Navbar---------------------

Template.navbar.events = {
  'click #newqueue': moveback,
  'click #myqueues': move
}

// ---------------------------------------------

function scanqueueqr() {
    if (Meteor.isCordova) {
	 cordova.plugins.barcodeScanner.scan(
            function (result) {
                alert("We got a barcode\n" +
                 "Result: " + result.text + "\n" +
                 "Format: " + result.format + "\n" +
                 "Cancelled: " + result.cancelled);

            		if (!result.cancelled) {
                  console.debug('not cancelled');
                  console.log('not cancelled');

                  Meteor.call('addUserToQueue', getUserPhone(), result.text, function(err, response) {
                      move();
                  }); 
    		        }
            }, 
            function (error) {
                alert("Scanning failed: " + error);
            }
        );
    }
}

function getUserPhone() {
  return '0504345645';
}

function move() {
    if (checkismain()) {
      $("#maincontent").fadeOut('slow', function() {
          Session.set("ismain", false);
      });  
    }
}

function moveback() {
    if (!checkismain()) {
      $("#queuecontent").fadeOut('slow', function() {
          Session.set("ismain", true);
      });  
    }
}

function checkismain() {
  return Session.get("ismain");
}

