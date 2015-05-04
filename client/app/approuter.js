appRoute = function()
{
	Router.map(function () {
	  	this.route('appHome',{
		  	path:'/',
		  	layoutTemplate: 'appLayout',
		  	//data: {ismain:true}
		  //	data: {ismain:Session.get('ismain')}
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