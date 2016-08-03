JUCI.app.controller("rtgraphsCtrl", function($scope, $uci){
	$scope.interfacesOLD = {};
	$scope.interfacesNEW = {};
	$scope.interfacesDIFF = {};
	$scope.bytes = {
		 "br-lan": { "rx":"0", "tx":"0"},
		 "eth2": { "rx":"0", "tx":"0"},
		 "eth4": { "rx":"0", "tx":"0"}
	};
	$scope.tick = 2000;

	$rpc.$call("router", "info").done(function(data){ //TODO: Change "info" to "interfaces"
		$scope.interfacesOLD = data;
		$scope.interfacesNEW = data;
	});

	function updateInterfaces(){
		$scope.interfacesOLD = $scope.interfacesNEW;
		$rpc.$call("router", "info").done(function(data){ //TODO: Change "info" to "interfaces"
			$scope.interfacesNEW = data;
			for(var key in data){
				if($scope.bytes[key]){
					$scope.bytes[key].tx = (parseInt($scope.interfacesNEW[key].tx) - parseInt($scope.interfacesOLD[key].tx)).toString();
					$scope.bytes[key].rx = (parseInt($scope.interfacesNEW[key].rx) - parseInt($scope.interfacesOLD[key].rx)).toString();
				}
			}
		});
		$scope.$apply(); //TODO: Needed?
	}

	setInterval(updateInterfaces,$scope.tick);



});
