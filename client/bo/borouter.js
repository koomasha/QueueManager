 boRoute = function()
{
	Router.map(function () {
	  	this.route('boDashboard',{
			path:'/',
			layoutTemplate: 'boLayout'
		});	  
	});
}