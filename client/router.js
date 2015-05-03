/* ********************************************
		MOBILE ROUTING
	***********************************  */

  	if (Meteor.isCordova) 
  	{
  		approute();
  	}
  	/* ********************************************
		BO ROUTING
	***********************************  */
  	else
  	{
  		boroute();
	}	


function boroute()
{
	Router.map(function () {
	  	this.route('dashboard',{
			path:'/',
			layoutTemplate: 'bolayout'
		});
		this.route('login',{
			path:'/login',
			layoutTemplate: 'bolayout',
		});
		this.route('signup',{
			path:'/signup',
			layoutTemplate: 'bolayout',
		});	  
	});
}

function approute()
{
	Router.map(function () {
	  	this.route('app',{
		  	path:'/',
		  	layoutTemplate: 'applayout',
		  	data: {ismain:true}
		});
		this.route('newqueue',{
		  	path:'/newqueue',
		  	layoutTemplate: 'applayout',
		});

		this.route('myqueues',{
		  	path:'/myqueues',
		  	layoutTemplate: 'applayout',
		}); 
	});
}