 boroute = function()
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