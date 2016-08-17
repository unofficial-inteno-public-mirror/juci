JUCI.app.controller("rtgraphsCtrl", function($scope, $uci){
	$scope.load = {
		"1 min" : 0,
		"5 min" : 0,
		"15 min" : 0
	};
	$scope.connections = {
		"udp_count" : 0,
		"tcp_count" : 0
	}
	$scope.traffic = {};
	$scope.tick = 1000;

	function updateInterfaces(){
		$rpc.$call("router.network", "traffic").done(function(data){
			$scope.traffic = data;
		});
		$scope.$apply();
	}

	function updateLoad(){
		$rpc.$call("router.network", "load").done(function(data){
			$scope.load = data.load;
		});
		$scope.$apply();
	}

	function updateConnections(){
		$rpc.$call("router.network", "connections").done(function(data){
			$scope.connections = data.connections;
		});
		$scope.$apply();
	}

	setInterval(updateInterfaces,$scope.tick);
	setInterval(updateLoad,$scope.tick);
	setInterval(updateConnections,$scope.tick);

});
