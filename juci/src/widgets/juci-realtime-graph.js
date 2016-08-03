JUCI.app
.directive("juciRealtimeGraph", function(){
	return {
		scope: {
			model: "=ngModel",
			id: "@id",
			tick: "=tick"
		}, 
		templateUrl: "/widgets/juci-realtime-graph.html",
		//template: '<div id={{id}}></div>',
		controller: "juciRealtimeGraphCtrl"
	}; 
})
.controller("juciRealtimeGraphCtrl", function($scope){
	if(!$scope.tick){ $scope.tick = 1000; }
	console.log("###############");
	console.log($scope.id);
	console.log("###############");

	var DELAY = $scope.tick; // delay[ms] to add new data points
	var groups = new vis.DataSet();
	var names = Object.keys($scope.model);
	for(var i=0; i<names.length; i++){
		groups.add({ id:i, content:names[i] });
	}
	/*
	groups.add({
		id: 0,
		content: "first"
		//options: {
		//	shaded: {
		//		orientation: 'top'
		//}}
	});
	groups.add({
		id: 1,
		content: "second"
	});
	*/


	// create a graph2d with an (currently empty) dataset
	var container = document.getElementById($scope.id);
	var dataset = new vis.DataSet();
	var options = {
		start: vis.moment().add(-30, 'seconds'), // changed so its faster
		end: vis.moment(),
		dataAxis: {
			left: {
				range: {
					min:0, max: 10000
				}
			}
		},
		drawPoints: {
			style: 'circle' // square, circle
		},
		shaded: {
			orientation: 'bottom' // top, bottom
		},
		legend: true
	};
	var graph2d = new vis.Graph2d(container, dataset, groups, options);

	function renderStep() {
		// move the window (you can think of different strategies).
		var now = vis.moment();
		var range = graph2d.getWindow();
		var interval = range.end - range.start;
		// continuously move the window
		graph2d.setWindow(now - interval, now, {animation: false});
		requestAnimationFrame(renderStep);
	}
	renderStep();

        // Add a new datapoint to the graph
	function addDataPoint() {
		// add a new data point to the dataset
		var now = vis.moment();
		var datatypes = Object.keys($scope.model);
		for(var i=0; i<datatypes.length; i++){
			dataset.add({
				x: now,
				y: $scope.model[datatypes[i]],
				group: i
			});
		}
		/*dataset.add({
			x: now,
			y: $scope.model,//y(now / 1000) //TODO: 1000? (=DELAY=TICK?)
			group: 1
		});
		*/

		// remove all data points which are no longer visible
		var range = graph2d.getWindow();
		var interval = range.end - range.start;
		var oldIds = dataset.getIds({
			filter: function (item) {
				return item.x < range.start - interval;
			}
		});
		dataset.remove(oldIds);

		setTimeout(addDataPoint, DELAY);

		// update y-axis so all datapoints are visible
		var maxData = dataset.max("y")["y"];
		var maxAxis = options.dataAxis.left.range.max;
		var minData = dataset.min("y")["y"];
		var minAxis = options.dataAxis.left.range.min;

		if(maxData > maxAxis){ options.dataAxis.left.range.max = maxData + 1 }
		if(minData < minAxis){ options.dataAxis.left.range.min = minData - 1 }
		graph2d.setOptions(options);

	}

	addDataPoint();
}); 
