JUCI.app
.controller("juciPortMirroringCtrl", function($scope, $uci){
	$uci.$sync("port-mirroring").done(function(data){
		$scope.data = $uci["port-mirroring"]["@port-mirroring"][0];
		console.log($scope.data);
		$scope.$apply();
	});
});
