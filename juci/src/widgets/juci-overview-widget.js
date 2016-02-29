//! Author: Reidar Cederqvist <reidar.cederqvist@gmail.com>

JUCI.app
.directive("juciOverviewWidget", function(){
	return {
		templateUrl: "/widgets/juci-overview-widget.html",
		scope: {
			title: "@",
			icon: "@",
			of: "@allowOverflow"
		},
		transclude: true,
		restrict: "E",
	};
});