/*
 * Copyright (C) 2015 Inteno Broadband Technology AB. All rights reserved.
 *
 * Author: Martin K. Schröder <mkschreder.uk@gmail.com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA
 */


JUCI.app
.directive("networkConnectionTypeNoneEdit", function(){
	return {
		scope: {
			interface: "=ngModel"
		},
		templateUrl: "/widgets/network-connection-type-none-edit.html",
		controller: "networkConnectionTypeNoneEdit",
		replace: true
	};
})
.controller("networkConnectionTypeNoneEdit", function($scope, $ethernet, $modal, $tr, gettext, $networkHelper){
	// expose tab title

	$ethernet.getAdapters().done(function(devs){
		$scope.baseDevices = devs.filter(function(dev){
			return dev.type !== "eth-bridge";
		}).map(function(dev){
			return { label: dev.name + " (" + dev.device + ")", value: dev.device };
		});
		var wan = $scope.baseDevices.find(function(dev){ return dev.value.match(/^eth[\d]+\.[\d]+$/); });
		if(wan){
			$scope.baseDevices = $scope.baseDevices.filter(function(dev){return wan.value.split(".")[0] != dev.value; });
		}
		$scope.$apply();
	});
	$scope.onChangeDevice = function(value, oldvalue){
		if(value == oldvalue) return false;
		$networkHelper.addDevice($scope.interface, value).done(function(){
			if(oldvalue.match(/^wl.+/)){
				$networkHelper.setNetwork(oldvalue, "none").done(function(){
					$scope.$apply();
				});
			}
		});
		return false;
	};
});
