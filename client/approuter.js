approute = function()
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