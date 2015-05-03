Router.map(function () {

/* ********************************************
		INDEX PAGE ROUTING
	***********************************  */

  	if (Meteor.isCordova) 
  	{
	  	this.route('mobile',{
		  	path:'/',
		  	layoutTemplate: 'mobilelayout',
		  	data: {ismain:true}
		});
  	}
  	else
  	{
	  	this.route('home',{
			path:'/',
			layoutTemplate: 'homelayout'
		});
	  	this.route('mobile',{
			path:'/mobile',
			layoutTemplate: 'mobilelayout',
			data: {ismain:true}
		});
	}

/* ********************************************
		BO ROUTING
	***********************************  */

	this.route('bo',{
		path:'/bo',
		layoutTemplate: 'bologinlayout',
	});

	this.route('dashboard',{
	  	path:'/dashboard',
	  	layoutTemplate: 'bolayout',
	});


/* ********************************************
		MOBILE ROUTING
	***********************************  */

		this.route('newqueue',{
	  	path:'/newqueue',
	  	layoutTemplate: 'mobilelayout',
	});

	this.route('myqueues',{
	  	path:'/myqueues',
	  	layoutTemplate: 'mobilelayout',
	});

	  
});

