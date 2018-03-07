
var clientPrototype = {

	headlineWeeklyChange: function(data){
		
	},

	chartWeeklySales: function(data)
	{

		// Highcharts.chart('sales-series-chart', 
	 	//    {
	      
	 	//    });
	},

	chartWeeklySalesOverview: function(data)
	{
		var sales = data.weekly_sales;
		var totalSalesTransactions = 0;
		var premiumSales = 0,
			growthSales = 0,
			starterSales = 0;

		//
		// ...
		//

		var chartData = [
			{
				name: 'Starter',
				y: starterSales
			},{
				name: 'Growth',
				y: growthSales
			},{
				name: 'Premium',
				y: premiumSales
			}
		];

		// Highcharts.chart('sales-overview-chart', {
		    
		// });
	},

	activeUserChart: function(data)
	{
		var dayLabels = [];
		var activityData = [];

		// 
		// ...
		// 

		// Highcharts.chart('active-user-chart', 
	 //    {
	    	
	 //    });

	},

	customerSupportChart: function(data)
	{
		var supportData = data.daily_support_calls;
		var dateLabels = [];

		// 
		// ...
		// 

		// Highcharts.chart('support-activity', 
	 //    {
	    	
	 //    });
	}

};


$(document).ready(function(){


	// First, pull in the data you're going to work with. Then:
		
		// 1. line-chart with weekly sales
		// 2. Pie chart with Sales data totals breakdown
		// 3. Col chart with active users
		// 4. Stacked column chart with support types
		// 5. Top page banner update
		
	


});