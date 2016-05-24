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
.directive("overviewWidget11WAN", function(){
	return {
		templateUrl: "widgets/overview-wan.html", 
		controller: "overviewWidgetWAN", 
		replace: true
	};
})
.directive("overviewStatusWidget11WAN", function(){
	return {
		templateUrl: "widgets/overview-wan-small.html", 
		controller: "overviewWidgetWAN", 
		replace: true
	};
})
.filter('formatTimer', function() {
    return function(seconds) {
		var numdays = Math.floor(seconds / 86400);
		var numhours = Math.floor((seconds % 86400) / 3600);
		var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
		var numseconds = ((seconds % 86400) % 3600) % 60;
		var sec = (numseconds < 10)? '0' + numseconds : '' + numseconds;
		if (numdays > 0) { return (numdays + 'd ' + numhours + 'h ' + numminutes + 'm ' + sec + 's');}
		if (numhours > 0) { return (numhours + 'h ' + numminutes + 'm ' + sec + 's');}
		if (numminutes > 0) { return (numminutes + 'm ' + sec + 's');}
		return (sec+ 's');
    };
})
.controller("overviewWidgetWAN", function($scope, $uci, $rpc, $firewall, $network, $juciDialog, $tr, gettext, $events){
	$scope.showDnsSettings = function(){
		if(!$scope.wan_ifs) return;
		$firewall.getZoneNetworks("wan").done(function(nets){
			var dhcp_nets = nets.filter(function(iface){
				return iface.proto.value == "dhcp";
			});
			var model = {
				aquired: $scope.wan_ifs,
				settings: dhcp_nets
			};
			$juciDialog.show("network-wan-dns-settings-edit", {
				title: $tr(gettext("Edit DNS servers")),
				buttons: [
					{ label: $tr(gettext("Save")), value: "save", primary: true },
					{ label: $tr(gettext("Cancel")), value: "cancel" }
				],
				on_button: function(btn, inst){
					if(btn.value == "cancel"){
						dhcp_nets.map(function(x){
							if(x.$reset) x.$reset();
						});
						inst.dismiss("cancel");
					}
					if(btn.value == "save"){
						inst.close();
					}
				},
				size: "md",
				model: model
			});
		});
	};
	$scope.statusClass = "text-success"; 
	JUCI.interval.repeat("update_wan_uptime", 1000, function(next){
		if(!$scope.wan_ifs || $scope.wan_ifs.length === 0){ next(); return; }
		$scope.wan_ifs.map(function(i){
			if(!i.uptime) return;
			i.uptime = i.uptime + 1;
		});
		$scope.$apply();
		next();
	});
	function refresh(){
		$network.getNetworks().done(function(networks){
			var bridgedNets = networks.filter(function(net){ return net.proto.value == "dhcp" && net.type.value == "bridge" && net.defaultroute.value});
			$firewall.getZoneNetworks("wan").done(function(wan_iface){
				var default_route_ifs = wan_iface.filter(function(x){ 
					if(bridgedNets.find(function(bn){ return bn[".name"] == x[".name"]; })) return false;
					return x.$info && x.$info.route && x.$info.route.length && 
						(x.$info.route.find(function(r){ return r.target == "0.0.0.0" || r.target == "::"; }));
				}); 
				var con_types = {}; 
				var all_gateways = {}; 
				var wan_ifs = default_route_ifs.concat(bridgedNets).filter(function(i){
					return (i.$info.up && i.$info.device && i.$info.route)
				});
				wan_ifs.map(function(wan_if){return wan_if.$info;}).map(function(i){
					var con_type = "ETH"; 
					if(i.device.match(/atm/)) con_type = "ADSL"; 
					else if(i.device && i.l3_device.match(/ptm/)) con_type = "VDSL"; 
					else if(i.device && i.l3_device.match(/wwan/)) con_type = "3G/4G"; 
					con_types[con_type] = con_type; 
					if(con_type && con_type.match(/^[AV]DSL$/)){
						$rpc.$call("router", "dslstats").done(function(data){
							if(!data || !data.dslstats || !data.dslstats.bearers || data.dslstats.bearers.length < 1) return;
							$scope.dslDown = [];
							data.dslstats.bearers.map(function(b){
								if(b.rate_down) $scope.dslDown.push(b.rate_down);
							});
							$scope.$apply();
						});
					}
					i.route.map(function(r){
						if(r.nexthop != "0.0.0.0" && r.nexthop != "::") // ignore dummy routes. Note that current gateways should actually be determined by pinging them, but showing all of them is sufficient for now. 
							all_gateways[r.nexthop] = true; 
					}); 
				}); 
				$scope.connection_types = Object.keys(con_types); 
				$scope.all_gateways = Object.keys(all_gateways); 
				$scope.wan_ifs = wan_ifs.map(function(iface){ return iface.$info; }) || []; 
				$scope.$apply(); 
			}); 
		}); 
	}refresh(); 
	$events.subscribe("network.interface", function(res){
		refresh();
	});
});
