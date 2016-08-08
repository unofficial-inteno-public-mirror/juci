JUCI.app.controller("rtgraphsCtrl", function($scope, $uci){
	$scope.load = {
		"1 m" : 0,
		"5 m" : 0,
		"15 m" : 0
	};
	$scope.connections = {
		"udp_count" : 0,
		"tcp_count" : 0
	}
	$scope.interfacesOLD = {};
	$scope.interfacesNEW = {};
	$scope.interfacesDIFF = {};
	$scope.bytes = {
		 "br-lan": { "rx":"0", "tx":"0"},
		 "eth2": { "rx":"0", "tx":"0"},
		 "eth4": { "rx":"0", "tx":"0"}
	};
	$scope.tick = 1000;

	$rpc.$call("router", "interfaces").done(function(data){
		$scope.interfacesOLD = data;
		$scope.interfacesNEW = data;
	});

	function updateInterfaces(){
		$scope.interfacesOLD = $scope.interfacesNEW;
		$rpc.$call("router", "interfaces").done(function(data){
			$scope.interfacesNEW = data;
			for(var key in data){
				if($scope.bytes[key]){
					$scope.bytes[key].tx = (parseInt($scope.interfacesNEW[key].tx) - parseInt($scope.interfacesOLD[key].tx)).toString();
					$scope.bytes[key].rx = (parseInt($scope.interfacesNEW[key].rx) - parseInt($scope.interfacesOLD[key].rx)).toString();
				}
			}
		});
		$scope.$apply();
	}

	function updateLoad(){
		function bitshift16(nr){ return nr/65535; }

		$rpc.$call("system", "info").done(function(data){
			load = data.load.map(bitshift16);
			$scope.load = {
				"1 m" : load[0],
				"5 m" : load[1],
				"15 m": load[2]
			};
		});
		$scope.$apply();
	}

	function updateConnections(){
		$rpc.$call("router", "info").done(function(data){
			$scope.connections = {
				"UDP" : data.system.udp_count,
				"TCP" : data.system.tcp_count
			};
		});
		$scope.$apply();
	}

	setInterval(updateInterfaces,$scope.tick);
	setInterval(updateLoad,$scope.tick);
	setInterval(updateConnections,$scope.tick);



});
