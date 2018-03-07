var testData;

var clientPrototype = {

	headlineWeeklyChange: function(data){
		var change = data.weekly_sales.weekly_percent_change;
		if( change > 0){
			$('#weekly-change').addClass('alert-success')
								.html('<h5>Sales change since last week: ' + change + '%</h5>');
		}else{
			$('#weekly-change').addClass('alert-danger')
								.html('<h5>Sales change since last week:  ' + change + '%</h5>');
		}
	},

	chartWeeklySales: function(data)
	{

		Highcharts.chart('sales-series-chart', 
	    {
	        title: {
	            text: 'Weekly Plan Sales'
	        },

	        subtitle: {
	            text: '7 day signups'
	        },

	        yAxis: {
	            title: {
	                text: 'Number of Sales'
	            }
	        },

	        xAxis: {
	            title: {
	                text: 'Day'
	            },
	            categories: data.weekly_sales.days
	        },
	        legend: {
	            layout: 'horizontal',
	            align: 'center',
	            verticalAlign: 'bottom'
	        },

	        series: data.weekly_sales.plan_signups,
	        credits: {
	        	enabled: false
	        }
	    });
	},

	chartWeeklySalesOverview: function(data)
	{
		var sales = data.weekly_sales;
		var totalSalesTransactions = 0;
		var premiumSales = 0,
			growthSales = 0,
			starterSales = 0;

		for (var i = 0; i < sales.plan_signups.length; i++) {
			
			var plan = sales.plan_signups[i];
			
			for (var z = 0; z < plan.data.length; z++) {
				totalSalesTransactions += plan.data[z];

				switch(plan.name){
					case 'starter': 
						starterSales += plan.data[z];
						break;
					case 'growth': 
						growthSales += plan.data[z];
						break;	
					case 'premium': 
						premiumSales += plan.data[z];
						break;
					default:
						break;	
				}

			}
		}

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

		Highcharts.chart('sales-overview-chart', {
		    chart: {
		        // plotBackgroundColor: null,
		        // plotBorderWidth: null,
		        // plotShadow: false,
		        type: 'pie'
		    },
		    title: {
		        text: 'Plan Breakdown'
		    },
		    subtitle: {
	            text: 'Last week\'s signups'
	        },
		    tooltip: {
		        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
		    },
		    plotOptions: {
		        pie: {
		            allowPointSelect: true,
		            cursor: 'pointer',
		            dataLabels: {
		                enabled: false,
		                // format: '<b>{point.name}</b>: {point.percentage:.1f} %',
		                // style: {
		                //     color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
		                // }
		            },
		            showInLegend: false
		        }
		    },
		    series: [{
		        name: 'Signups',
		        colorByPoint: true,
		        data: chartData
		    }],
		    credits: {
		    	enabled: false
		    }
		});

		console.log(totalSalesTransactions);
		console.log(premiumSales, growthSales, starterSales );
	},

	activeUserChart: function(data)
	{
		var dayLabels = [];
		var activityData = [];

		for (var i = 0; i < data.daily_active_users.length; i++) {
			dayLabels.push(data.daily_active_users[i].date);
			activityData.push(data.daily_active_users[i].active_percent);
		}

		Highcharts.chart('active-user-chart', 
	    {
	    	chart: {
	    		type: 'column'
	    	},
	        title: {
	            text: 'Customer engagement levels'
	        },

	        subtitle: {
	            text: '7 day active user %'
	        },

	        yAxis: {
	            title: {
	                text: 'Percentage of Active Users'
	            }
	        },

	        xAxis: {
	            title: {
	                text: 'Day'
	            },
	            categories: dayLabels	       
	        },
	        legend: {
	            layout: 'horizontal',
	            align: 'center',
	            verticalAlign: 'bottom'
	        },

	        series: [
	        	{
	        		name: '% Active Users',
	        		data: activityData
	        	}
	        ],
	        credits: {
	        	enabled: false
	        }
	    });

	},

	customerSupportChart: function(data)
	{
		var supportData = data.daily_support_calls;
		var dateLabels = [];

		var dateLabels = _.pluck(supportData, 'date');

		var queries = [
			{
				name: 'Queries Escalated',
				data: _.pluck(supportData, 'queries_escalated')
			},
			{
				name: 'Unresolved Queries',
				data: _.pluck(supportData, 'queries_unresolved')
			},
			{
				name: 'Queries Resolved',
				data: _.pluck(supportData, 'queries_resolved')
			}
		];

		Highcharts.chart('support-activity', 
	    {
	    	chart: {
	    		type: 'column'
	    	},
	        title: {
	            text: 'Support levels'
	        },

	        subtitle: {
	            text: ''
	        },

	        yAxis: {
	            title: {
	                text: 'Percentage of Active Users'
	            },
		        stackLabels: {
		            enabled: true,
		            style: {
		                fontWeight: 'bold',
		                color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
		            }
		        }
	        },

	        xAxis: {
	            title: {
	                text: 'Day'
	            },
	            categories: dateLabels	       
	        },
	        legend: {
	            layout: 'horizontal',
	            align: 'center',
	            verticalAlign: 'bottom'
	        },
	        plotOptions: {
		        column: {
		            stacking: 'normal',
		            dataLabels: {
		                enabled: true
		            }
		        }
		    },
	        series: queries,
	        credits: {
	        	enabled: false
	        }
	    });
	}



}


$(document).ready(function(){

	

	$.get('/data/data.json', function(data){
		
		// 1. line-chart with weekly sales
		clientPrototype.headlineWeeklyChange(data);
		clientPrototype.chartWeeklySales(data);
		clientPrototype.chartWeeklySalesOverview(data);
		clientPrototype.activeUserChart(data);
		clientPrototype.customerSupportChart(data);

		
	},'json');


});