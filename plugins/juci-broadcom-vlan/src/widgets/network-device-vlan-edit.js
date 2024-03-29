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
.directive("networkDeviceVlanEdit", function(){
	return {
		scope: {
			device: "=ngModel"
		}, 
		templateUrl: "/widgets/network-device-vlan-edit.html", 
		controller: "networkDeviceVlanEdit", 
		replace: true
	};  
})
.controller("networkDeviceVlanEdit", function($scope, $network, $uci){
	$scope.$watch("device", function(value){
		$scope.data = {
			base_device: ""
		};
		if(!value) return; 
		var parts = $scope.device.ifname.value.split("."); 
		if(parts.length != 2) return; 
		$scope.data.base_device = parts[0]; 
	}, false); 
	$scope.$watch("device.vlan8021q.value", function(value){
		if(!$scope.device) return; 
		$scope.device.ifname.value = $scope.data.base_device+"."+value; 
	}, false); 
	$scope.$watch("data.base_device", function(value){
		if(!$scope.device || !$scope.data || !$scope.data.base_device) return; 
		$scope.device.ifname.value = value+"."+$scope.device.vlan8021q.value; 
		$scope.device.baseifname.value = value; 
	}, false); 
	$uci.$sync(["layer2_interface_vdsl", "layer2_interface_adsl", "layer2_interface_ethernet"]).done(function(){
		var vdslDevs = $uci.layer2_interface_vdsl["@vdsl_interface"].map(function(x){return {label:x.name.value + " (" + x.baseifname.value + ")", value:x.baseifname.value}});
		var adslDevs = $uci.layer2_interface_adsl["@atm_bridge"].map(function(x){return {label:x.name.value + " (" + x.baseifname.value + ")", value:x.baseifname.value}});
		var ethDevs = $uci.layer2_interface_ethernet["@ethernet_interface"].map(function(x){return {label:x.name.value + " (" + x.baseifname.value + ")", value:x.baseifname.value}});
		$scope.baseDevices = vdslDevs.concat(adslDevs).concat(ethDevs);
		$scope.$apply();
	});
}); 
