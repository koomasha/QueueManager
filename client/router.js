Router.map(function () {

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

	this.route('bo',{
		path:'/bo',
		layoutTemplate: 'bolayout',
	});
	this.route('dashboard',{
	  	path:'/dashboard',
	  	layoutTemplate: 'bolayout',
	});
	  
});

