Router.map(function () {

/* ********************************************
		INDEX PAGE ROUTING
	***********************************  */

  	if (Meteor.isCordova) 
  	{
	  	this.route('app',{
		  	path:'/',
		  	layoutTemplate: 'applayout',
		  	data: {ismain:true}
		});
  	}
  	else
  	{
	  	this.route('home',{
			path:'/',
			layoutTemplate: 'bolayout'
		});
	  	this.route('app',{
			path:'/app',
			layoutTemplate: 'applayout',
			data: {ismain:true}
		});
	}

/* ********************************************
		BO ROUTING
	***********************************  */

	this.route('bo',{
		path:'/bo',
		layoutTemplate: 'bolayout',
	});

	this.route('login',{
		path:'/login',
		layoutTemplate: 'bolayout',
	});
	this.route('signup',{
		path:'/signup',
		layoutTemplate: 'bolayout',
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
	  	layoutTemplate: 'applayout',
	});

	this.route('myqueues',{
	  	path:'/myqueues',
	  	layoutTemplate: 'applayout',
	});

	  
});

