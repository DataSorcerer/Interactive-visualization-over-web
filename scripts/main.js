
var clientPrototype = {

	relatePrecipitationTweets: function () {
		/*
The purpose of this demo is to demonstrate how multiple charts on the same page
can be linked through DOM and Highcharts events and API methods. It takes a
standard Highcharts config with a small variation for each data set, and a
mouse/touch event handler to bind the charts together.
*/



		/**
		 * In order to synchronize tooltips and crosshairs, override the
		 * built-in events with handlers defined on the parent element.
		 */
		$('#container').bind('mousemove touchmove touchstart', function (e) {
			var chart,
				point,
				i,
				event;

			for (i = 0; i < Highcharts.charts.length; i = i + 1) {
				chart = Highcharts.charts[i];
				// Find coordinates within the chart
				event = chart.pointer.normalize(e.originalEvent);
				// Get the hovered point
				point = chart.series[0].searchPoint(event, true);

				if (point) {
					point.highlight(e);
				}
			}
		});
		/**
		 * Override the reset function, we don't need to hide the tooltips and
		 * crosshairs.
		 */
		Highcharts.Pointer.prototype.reset = function () {
			return undefined;
		};

		/**
		 * Highlight a point by showing tooltip, setting hover state and draw crosshair
		 */
		Highcharts.Point.prototype.highlight = function (event) {
			event = this.series.chart.pointer.normalize(event);
			this.onMouseOver(); // Show the hover marker
			this.series.chart.tooltip.refresh(this); // Show the tooltip
			this.series.chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
		};

		/**
		 * Synchronize zooming through the setExtremes event handler.
		 */
		function syncExtremes(e) {
			var thisChart = this.chart;

			if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
				Highcharts.each(Highcharts.charts, function (chart) {
					if (chart !== thisChart) {
						if (chart.xAxis[0].setExtremes) { // It is null while updating
							chart.xAxis[0].setExtremes(
								e.min,
								e.max,
								undefined,
								false,
								{ trigger: 'syncExtremes' }
							);
						}
					}
				});
			}
		}

		// Get the data. The contents of the data file can be viewed at
		$.getJSON(
			'https://cdn.rawgit.com/highcharts/highcharts/057b672172ccc6c08fe7dbb27fc17ebca3f5b770/samples/data/activity.json',
			function (activity) {
				$.each(activity.datasets, function (i, dataset) {

					// Add X values
					dataset.data = Highcharts.map(dataset.data, function (val, j) {
						return [activity.xData[j], val];
					});

					$('<div class="chart">')
						.appendTo('#container')
						.highcharts({
							chart: {
								marginLeft: 40, // Keep all charts left aligned
								spacingTop: 20,
								spacingBottom: 20
							},
							title: {
								text: dataset.name,
								align: 'left',
								margin: 0,
								x: 30
							},
							credits: {
								enabled: false
							},
							legend: {
								enabled: false
							},
							xAxis: {
								crosshair: true,
								events: {
									setExtremes: syncExtremes
								},
								labels: {
									format: '{value} km'
								}
							},
							yAxis: {
								title: {
									text: null
								}
							},
							tooltip: {
								positioner: function () {
									return {
										// right aligned
										x: this.chart.chartWidth - this.label.width,
										y: 10 // align to title
									};
								},
								borderWidth: 0,
								backgroundColor: 'none',
								pointFormat: '{point.y}',
								headerFormat: '',
								shadow: false,
								style: {
									fontSize: '18px'
								},
								valueDecimals: dataset.valueDecimals
							},
							series: [{
								data: dataset.data,
								name: dataset.name,
								type: dataset.type,
								color: Highcharts.getOptions().colors[i],
								fillOpacity: 0.3,
								tooltip: {
									valueSuffix: ' ' + dataset.unit
								}
							}]
						});
				});
			}
		);

	},

	/**
	 * Function that shows daily weather warnings issued in UK during storm Emma
	 * 
	 */
	trackUKWeather: function () {

		var regionsUK,
			activeLayer;
		var dates = ['26-Feb', '27-Feb', '28-Feb', '01-Mar', '02-Mar', '03-Mar', '04-Mar'];
		var selectedDate = 0;
		var map = new L.Map('weather-UK', {
			center: new L.LatLng(53.8193944, -7.5976246),
			zoom: 0
		});

		/**
         * Function that adds features and layers to map initially
         * 
         */
		function prepareMap() {
			$.getJSON('../data/Regions_December_2017_Super_Generalised_Clipped_Boundaries_in_England.geojson', function (data) {
				regionsUK = L.geoJSON(data, {
					style: styleRegionWarnings,
					onEachFeature: onEachFeature,
				}).addTo(map);
			});
		}

		/**
		 * Function to create a slider for selecting dates
		 * 
		 */
		$(function () {
			$("#date").text(dates[0] + "-2018");
			$("#slider").slider({
				value: 0,
				min: 0,
				max: 6,
				step: 1,
				slide: function (event, ui) {
					selectedDate = ui.value;
					//update date legend displayed over map layer
					$(".temporal-legend").text(dates[selectedDate]);
					//update the chloropeth map
					prepareMap();
					//update date label displayed besides slider
					$("#date").text(dates[selectedDate] + "-2018");
				}

			});

		});

		/**
         * To add autoplay functionality to chloropeth map; updates slider position as well
         * 
         */
		$(function () {
			$("#btnPlay").click(function (event) {
				dt = selectedDate;
				var play = setInterval(function () {
					//update slider position
					$("#slider").slider("value", dt);
					selectedDate = dt;
					$(".temporal-legend").text(dates[selectedDate]);
					prepareMap();
					$("#date").text(dates[selectedDate] + "-2018");
					dt = dt + 1;
					//check if all dates from data are exhausted, if yes, then stop
					if (dt == dates.length) {
						clearInterval(play);
					}
				}, 1000);

			});
		});

		//Load open map tile layer
		L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
			minZoom: 5,
			maxZoom: 15,
			noWrap: true,
			attribution: 'Data: Twitter.com API | Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
		}).addTo(map);

		prepareMap();

		//Set initial value of date over map
		createDateLegend(dates[0]);

		/**
         * /Appropriately color regions on chloropth map
         * @param warningLevel: weather warning level issued by the Met dept. for a particular region
         */
		function getColor(warningLevel) {

			return warningLevel == 1 ? '#98FB98' :
				warningLevel == 2 ? '#ffff00' :
					warningLevel == 3 ? '#ffbf00' :
						'#C70039';

		}

		/////////////////////////////////////////////////////////////
		// Adding Colour Warnings legend on the map
		var legend = L.control({ position: 'bottomleft' });

		legend.onAdd = function (map) {

			var div = L.DomUtil.create('div', 'info legendWarning'),
				warningLevels = [1, 2, 3, 4],
				warnings = ['No warning', 'Yellow warning', 'Amber warning', 'Red warning'];

			for (var i = 0; i < warningLevels.length; i++) {
				div.innerHTML +=
					'<i style="background:' + getColor(warningLevels[i]) + '"></i> ' +
					warnings[i] + '<br/>';
			}

			return div;
		};

		legend.addTo(map);

		/////////////////////////////////////////////////////////////
        /**
         * Return style info for the map layer
         * 
         * @param  geojson feature
         * @return object
         */
		function styleRegionWarnings(feature) {

			return {
				fillColor: getColor(feature.properties[dates[selectedDate]]),      // change this to call the getColor function to find appropriate colour 
				weight: 1,
				opacity: 1,
				color: '#fff',
				dashArray: '3',
				fillOpacity: 0.8
			};
		}

		/**
		 * Add a pop with region name acc. to each feature in the layer
		 * @param feature: point in geoJSON file,
		 * @param layer: layer in map
		 * 
		 */
		function onEachFeature(feature, layer) {
			var popUpContent = '<strong>Region: </strong>' + feature.properties.rgn17nm;
			layer.bindPopup(popUpContent);
		}

		/**
		 * Function to add date legend for which map is displayed
		 * 
		 * @param  string startDate: Initial date (26th Feb, 2018)
		 */
		function createDateLegend(startDate) {
			var temporalLegend = L.control({ position: 'topright' });
			temporalLegend.onAdd = function (map) {
				var output = L.DomUtil.create("output", "temporal-legend");
				return output;
			}
			temporalLegend.addTo(map);
			$(".temporal-legend").text(startDate);
		}
	},

	/**
 * Function to create a word cloud with top hashtags in the tweets
 * Uses highcharts word cloud
 */
	topHashtagsWordCloud: function () {

		//set default ranks to be displayed
		var fromRank = 15;
		var toRank = 40;
		$(function () {
			$("#slider-range").slider({
				range: true,
				min: 1,
				max: 50,
				//default is rank 10 to 20
				values: [15, 40],
				slide: function (event, ui) {
					$("#tagRanks").text(ui.values[0] + " to " + ui.values[1]);
					fromRank = ui.values[0];
					toRank = ui.values[1];
					plotHashTagWordCloud();
				}
			});
			$("#tagRanks").text($("#slider-range").slider("values", 0) +
				" to " + $("#slider-range").slider("values", 1));
		});

		/**
 * Function to plot word cloud from top top 50 hashtags in tweets
 * uses Highcharts word cloud
 */
		function plotHashTagWordCloud() {
			$.getJSON('../data/top50Hashtags.json', function (data) {
				Highcharts.chart('hashtags-wordcloud', {
					series: [{
						type: 'wordcloud',
						data: data.slice(fromRank, toRank),
						name: 'Occurrences'
					}],
					title: {
						text: 'Wordcloud of top Hashtags'
					}
				});
			});
		}

		plotHashTagWordCloud();

	},

	/**
	 * Function to plot line charts over timeseries data of people tweeting about food items
	 * uses Highcharts line plot
	 */
	analyseFoodStocks: function () {
		$.getJSON('../data/foodstuffs.json', function (data) {
			Highcharts.chart('food-stocks', {
				title: {
					text: 'Snow triggers panic for food stuffs'
				},

				subtitle: {
					text: 'Food Items vs Number of tweets mentioning them'
				},

				yAxis: {
					title: {
						text: 'Number of tweets'
					}
				},

				xAxis: {
					title: {
						text: 'Date'
					},
					categories: data.foodTweets.days
				},
				legend: {
					layout: 'horizontal',
					align: 'center',
					verticalAlign: 'bottom'
				},
				//Number of tweets mentioning food items
				series: data.foodTweets.items,
				credits: {
					enabled: false
				}
			});
		});
	},

	/**
	 * Plot locations & tweets of top 10 most favourited tweets about storm Emma in UK and Ireland respectively
	 * 
	 */
	UKIrelandMapOverview: function () {
		var geojson,
			activeLayer;
		var map = new L.Map('map-holder', {
			center: new L.LatLng(54.1810154, -9.553191),
			zoom: 0
		});

		L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
			minZoom: 5,
			maxZoom: 15,
			noWrap: true,
			attribution: 'Data: Twitter.com API | Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
		}).addTo(map);


		$.getJSON('../data/favouriteTweets.json', function (data) {


			geojson = L.geoJSON(data, {
				//  look of the layer
				style: {
					color: '#fff',
					weight: 1,
					fillColor: '#0D6759',
					fillOpacity: 1
				}

				// interaction
				,
				onEachFeature: onEachFeature
			}).addTo(map);
		});


		function highlightLayer(e) {
			var layer = e.target;
			activeLayer = layer;

			layer.setStyle({
				color: '#fff',
				fillColor: '#3ab34a'
			});

			if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
				layer.bringToFront();
			}

		}

		function resetHighlight(e) {
			geojson.resetStyle(e.target);
		}


		function onEachFeature(feature, layer) {
			//console.log(feature.properties.FIRST_CO_ENGLISH);
			//console.log(layer);

			layer.on({
				mouseover: highlightLayer,
				mouseout: resetHighlight
			});
			var popUpContent = '<strong>Location: </strong>' + feature.properties.location +
				'<br>' + feature.properties.text + '<br><b>Favourite Count: </b>' +
				feature.properties.favorite_count +
				'<br><b>Tweeted on: </b>' + feature.properties.created_at;
			layer.bindPopup(popUpContent);
		}
	}

};


$(document).ready(function () {
	//Call appropriate function based on the referring page
	if (document.location.href.search('FavouriteTweets') > 0) {
		clientPrototype.UKIrelandMapOverview();
	}

	if (document.location.href.search('WeatherWarnings') > 0) {
		clientPrototype.trackUKWeather();
	}

	if (document.location.href.search('PopularHashtags') > 0) {
		clientPrototype.topHashtagsWordCloud();
	}
	if (document.location.href.search('FoodStocks') > 0) {
		clientPrototype.analyseFoodStocks();
	}
	if (document.location.href.search('index') > 0) {
		clientPrototype.analyseFoodStocks();
	}
});