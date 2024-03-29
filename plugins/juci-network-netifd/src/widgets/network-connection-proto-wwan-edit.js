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
.directive("networkConnectionProtoWwanEdit", function(){
	return {
		scope: {
			interface: "=ngModel"
		}, 
		templateUrl: "/widgets/network-connection-proto-wwan-edit.html", 
		controller: "networkConnectionProtoWwanEditCtrl",
		replace: true
	};
}).controller("networkConnectionProtoWwanEditCtrl", function($scope, $tr, gettext, $rpc){
	$rpc.$call("router", "usb").done(function(ret){
		$scope.devices = Object.keys(ret).map(function(r){ return ret[r];}).filter(function(dev){return dev.netdevice;}).map(function(dev){ return { label: dev.description || $tr(gettext("Unknown")), value: dev.netdevice }; });
		$scope.$apply();
	}).fail(function(e){console.log(e);});
	$scope.authtypes = [
		{ label: $tr(gettext("PAP")), value: "pap" },
		{ label: $tr(gettext("CHAP")), value: "chap" },
		{ label: $tr(gettext("Both")), value: "both" },
		{ label: $tr(gettext("None")), value: "" }
	];
}); 
