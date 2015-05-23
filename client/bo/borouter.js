 boRoute = function()
{
	Router.map(function () {
	  	this.route('boDashboard',{
			path:'/',
			layoutTemplate: 'boLayout'
		});
	/*	this.route('boLogin',{
			path:'/login',
			layoutTemplate: 'boLayout',
		});*/
/*		this.route('boSignup',{
			path:'/signup',
			layoutTemplate: 'boLayout',
		});*/	  
	});
}