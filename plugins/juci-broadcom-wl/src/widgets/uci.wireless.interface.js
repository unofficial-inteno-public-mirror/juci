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
.directive("uciWirelessInterface", function(){
	return {
		templateUrl: "/widgets/uci.wireless.interface.html", 
		scope: {
			interface: "=ngModel"
		}, 
		controller: "WiFiInterfaceController", 
		replace: true, 
		require: "^ngModel"
	};  
}).controller("WiFiInterfaceController", function($scope, $uci, $tr, gettext, $wireless, $network){
	$scope.errors = []; 
	$scope.showPassword = true; 
	$wireless.getDefaults().done(function(res){
		if(res && res.keys && res.keys.wpa)$scope.default_key = res.keys.wpa;
	});
	
	$scope.$on("error", function(ev, err){
		ev.stopPropagation(); 
		$scope.errors.push(err); 
	}); 

	$scope.keyChoices = [
		{label: $tr(gettext("Key")) + " #1", value: 1},
		{label: $tr(gettext("Key")) + " #2", value: 2},
		{label: $tr(gettext("Key")) + " #3", value: 3},
		{label: $tr(gettext("Key")) + " #4", value: 4}
	];

	$scope.psk2_ciphers = [
		{label: $tr(gettext("Auto")), value: "auto"},
		{label: $tr(gettext("CCMP (AES)")), value: "ccmp"}
	];

	$scope.mixed_psk_ciphers = [
		{label: $tr(gettext("Auto")), value: "auto"},
		{label: $tr(gettext("CCMP (AES)")), value: "ccmp"},
		{label: $tr(gettext("TKIP/CCMP (AES)")), value: "tkip+ccmp"}
	];  
	
	$scope.cryptoChoices = [
		{ label: $tr(gettext("None")), value: "none" },
		{ label: $tr(gettext("WEP")), value: "wep-open" },
		{ label: $tr(gettext("WPA2 Personal (PSK)")), value: "psk2" },
//		{ label: $tr(gettext("WPA Personal (PSK)")), value: "psk" }, //not supported
		{ label: $tr(gettext("WPA/WPA2 Personal (PSK) Mixed Mode")), value: "mixed-psk" },
		{ label: $tr(gettext("WPA2 Enterprise")), value: "wpa2" },
//		{ label: $tr(gettext("WPA Enterprise")), value: "wpa" }, //not supported
		{ label: $tr(gettext("WPA/WPA2 Enterprise Mixed Mode")), value: "wpa-mixed" }
	]; 
	
	$network.getNetworks().done(function(nets){
		$scope.networks = nets.map(function(net){
			return { label: String(net[".name"]).toUpperCase(), value: net[".name"] }; 
		}); 
		$scope.$apply(); 
	}); 
	
	$wireless.getDevices().done(function(devices){
		$scope.devices = devices.map(function(x){
			return { label: x[".frequency"], value: x[".name"] }; 
		}); 
		$scope.$apply(); 
	}); 

	$scope.$watch("interface", function(value){
		if(!value) return; 
		//$scope.title = "wifi-iface.name="+$scope.interface[".name"]; 
	});

	$scope.$watch("interface.closed.value", function(value, oldvalue){
		if(!$scope.interface) return; 
		if(value && value != oldvalue){
			if($scope.interface.wps_pbc.value && !confirm($tr(gettext("If you disable SSID broadcasting, WPS function will be disabled as well. You will need to enable it manually later. Are you sure you want to continue?")))){
				setTimeout(function(){
					$scope.interface.closed.value = oldvalue; 
					$scope.$apply(); 
				},0); 
			} else {
				$scope.interface.wps_pbc.value = false; 
			}
		}
	}); 
	
	$scope.onEncryptionChanged = function(value, oldvalue){
		if(!$scope.interface) return; 
		switch(value){
			case "none": {
				if(oldvalue && value != oldvalue){
					if(!confirm("WARNING: Disabling encryption on your router will severely degrade your security. Are you sure you want to disable encryption on this interface?")){
						setTimeout(function(){
							$scope.interface.encryption.value = oldvalue; 
							$scope.$apply(); 
						},0); 
					}
				}
				break; 
			}
			case "wep":
			case "wep-open": {
				$scope.interface.key.value = "";
			}
			case "wep-shared": {
				if($scope.interface.wps_pbc.value && !confirm($tr(gettext("WPS will be disabled when using WEP encryption. Are you sure you want to continue?")))){
					setTimeout(function(){
						$scope.interface.encryption.value = oldvalue; 
						$scope.$apply(); 
					},0); 
				} else {
					$scope.interface.wps_pbc.value = false; 
				}
				break; 
			}
			case "mixed-psk": {
				if(!$scope.mixed_psk_ciphers.find(function(i){ return i.value == $scope.interface.cipher.value}))
					$scope.interface.cipher.value = "tkip+ccmp";
				break; 
			}
			case "psk2": {
				if(!$scope.psk2_ciphers.find(function(i){ return i.value == $scope.interface.cipher.value}))
					$scope.interface.cipher.value = "ccmp";
				break; 
			}
		}
	}

	$scope.onPreApply = function(){
		$scope.errors.length = 0; 
	}
	$scope.toggleShowPassword = function(){
		$scope.showPassword = !$scope.showPassword; 
	}
}); 
