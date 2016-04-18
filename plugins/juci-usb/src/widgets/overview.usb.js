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
.directive("overviewWidget20USB", function(){
	return {
		templateUrl: "widgets/overview.usb.html", 
		controller: "overviewWidget20USBCtrl", 
		replace: true
	};
})
.directive("overviewStatusWidget20USB", function(){
	return {
		templateUrl: "widgets/overview.usb.small.html", 
		controller: "overviewWidget20USBCtrl", 
		replace: true
	};
})
.controller("overviewWidget20USBCtrl", function($scope, $uci, $usb, $events, $juciDialog, $tr, gettext){
	$events.subscribe("hotplug.usb", function(res){
		if(res.data && res.data.action && (res.data.action == "add" || res.data.action == "remove")){
			update();
		}
	});
	function update(){
		$usb.getDevices().done(function(devices){
			$scope.devices = devices || [];
			console.log($scope.devices);
			$scope.$apply(); 
		}); 
	}update();

	$scope.createShare = function(device){
		function showModal(sambaShare){
			$juciDialog.show("samba-share-edit", {
				title: device.product,
				model: sambaShare,
				buttons: [
					{label: $tr(gettext("Save")), value: "Save", primary: "true"},
					{label: $tr(gettext("Delete")), value: "Delete"},
					{label: $tr(gettext("Cancel")), value: "Cancel"}
				],
				on_button: function(btn,dialog){
					if(btn.label==="Save"){ dialog.close(); }
					if(btn.label==="Delete"){ sambaShare.$delete().always(function(){dialog.close();}); }
					if(btn.label==="Cancel"){ sambaShare.$reset(); dialog.close(); }
				}
			});
		}

		$uci.$sync("samba").done(function(){
			var existingShare = $uci.samba["@sambashare"].find(function(sambashare){return sambashare.path.value === "/mnt/"+device.mntdir});
			if(existingShare){
				showModal(existingShare);
			}
			else{
				$uci.samba.$create({
					".type":"sambashare",
					"name": $tr(gettext("Share for "+device.product)),
					"path": "/mnt/"+device.mntdir
				}).done(function(newShare){
					//var newShare = $uci.samba["@sambashare"].find(function(sambashare){return sambashare.path.value === "/mnt/"+device.mntdir});
					showModal(newShare);
				});
			}
		});

	};
}); 
