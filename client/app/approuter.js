appRoute = function()
{
	Router.map(function () {
	  	this.route('appHome',{
		  	path:'/',
		  	layoutTemplate: 'appLayout',
		  	data: {ismain:true}
		});
		this.route('appNewqueue',{
		  	path:'/newqueue',
		  	layoutTemplate: 'appLayout',
		});

		this.route('appMyqueues',{
		  	path:'/myqueues',
		  	layoutTemplate: 'appLayout',
		}); 
	});
}