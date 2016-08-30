JUCI.app.controller("rtgraphsCtrl", function($scope, $uci, $wireless){
	var mapIface = {};
	$uci.$sync("ports").done(function(){
		$scope.portnames = $uci.ports["@all"];
		for (var i in $scope.portnames){
			if (typeof $scope.portnames[i] === 'function') { continue; }
			var key = $scope.portnames[i].ifname.value;
			var val = $scope.portnames[i][".name"];
			mapIface[key] = val;
		}
		$scope.$apply();
	});
	$uci.$sync("wireless").done(function(){
		$scope.wifaces = $uci.wireless["@wifi-iface"];
		for (var i in $scope.wifaces){
			if (!$scope.wifaces[i].ifname) { continue; }
			var key = $scope.wifaces[i].ifname.value;
			var val = $scope.wifaces[i].ssid.value;
			mapIface[key] = val;
		}
		$wireless.getInterfaces().done(function(data){
			for (var i in data) {
				if (typeof data[i] === 'function') { continue; }
				var wdevice = data[i].device.value;
				var wiface = data[i].ifname.value;
				var freq = data[i][".frequency"];
				mapIface[wdevice] = mapIface[wdevice] + " " + freq;
			}
			$scope.$apply();
		});
	});
	$scope.load = {
		"1 min" : 0,
		"5 min" : 0,
		"15 min" : 0
	};
	$scope.connections = {
		"udp_count" : 0,
		"tcp_count" : 0
	};
	$scope.traffic = {};
	$scope.tick = 1000;

	//function updateInterfaces(){
	//	$rpc.$call("router.network", "traffic").done(function(data){
	//		$scope.traffic = data;
	//	});
	//	$scope.$apply();
	//}
	function updateInterfaces(){
		$rpc.$call("router.network", "traffic").done(function(data){
			var traffic = {};
			var newKey = undefined;
			for (var key in data) {
				newKey = mapIface[key];
				if (!newKey){ continue; }
				traffic[newKey] = data[key];
			}
			$scope.traffic = traffic;
			$scope.$apply();
		}).fail(function(e){console.log(e);});
	}

	function updateLoad(){
		$rpc.$call("router.network", "load").done(function(data){
			$scope.load = data.load;
			$scope.$apply();
		}).fail(function(e){console.log(e);});
	}

	function updateConnections(){
		$rpc.$call("router.network", "connections").done(function(data){
			$scope.connections = data.connections;
			$scope.$apply();
		}).fail(function(e){console.log(e);});
	}

	//TODO: STOP "THREADS" BEFORE STARTING NEW ONES
	JUCI.interval.repeat("updateInterfaces",$scope.tick,function(next){
		updateInterfaces();
		next();
	});
	JUCI.interval.repeat("updateLoad",$scope.tick,function(next){
		updateLoad();
		next();
	});
	JUCI.interval.repeat("updateConnections",$scope.tick,function(next){
		updateConnections();
		next();
	});
	//setInterval(updateInterfaces,$scope.tick);
	//setInterval(updateLoad,$scope.tick);
	//setInterval(updateConnections,$scope.tick);

});
