JUCI Webgui for Embedded Routers
--------------------------------

JUCI is a JavaScript-based web interface for broadband routers running iopsys/OpenWRT.

JUCI is built with html5, angularjs and bootstrap:

![Desktop](/media/screenshot.jpg?raw=true "JUCI Screenshot")

JUCI is theme-able and fully mobile-ready (responsive):

![Mobile](/media/mobile.jpg)

What is JUCI?
-------------

If offers you the following:

* Extremely resource-efficient for your device - your router only needs to run the core functions (which can be written in C!) and the gui itself is running entirely inside the client's browser). You router only computes and sends the minimum information necessary.
* Full mobile support
* Easy to work with - the code uses angular.js and html5, making it extremely easy to add new gui elements to the gui.
* Full control and flexibility - yet many ready-made components: allowing you to pick yourself which level you want to develop on. There are no restrictions to the look and feel of your gui.
* Dynamic theming - you can switch color themes at runtime.
* Full language support - allowing for complete localization of your gui. Language file generation is even partially automatic (for html text). Also supporting dynamically changing language on page without having to reload the application. Also featuring quick debug mode for translations where you can see which strings are missing in currently used language pack.

Usage on OpenWRT
----------------

You can now try JUCI on openwrt.

Here is how to install it:

- Add juci feed to your feeds.conf.default
src-git-full juci git@public.inteno.se:juci.git

- Update and install the feed (with -f to force overrides)
./scripts/feeds update juci
./scripts/feeds install -f -p juci -a

- select juci core, inteno theme and plugins under JUCI menu in menuconfig
  (NOTE: some plugins conflict with eachother so you can not select
  juci-broadcom-wl and juci-openwrt-wireless at the same time).

For example, you could append this to your .config and then do make defconfig:

	CONFIG_PACKAGE_juci-ubus-core=y
	# CONFIG_PACKAGE_juci-asterisk is not set
	# CONFIG_PACKAGE_juci-broadcom-dsl is not set
	# CONFIG_PACKAGE_juci-broadcom-ethernet is not set
	# CONFIG_PACKAGE_juci-broadcom-vlan is not set
	# CONFIG_PACKAGE_juci-broadcom-wl is not set
	CONFIG_PACKAGE_juci-ddns=y
	CONFIG_PACKAGE_juci-diagnostics=y
	CONFIG_PACKAGE_juci-dnsmasq-dhcp=y
	CONFIG_PACKAGE_juci-dropbear=y
	CONFIG_PACKAGE_juci-ethernet=y
	CONFIG_PACKAGE_juci-event=y
	CONFIG_PACKAGE_juci-firewall-fw3=y
	# CONFIG_PACKAGE_juci-freecwmp is not set
	# CONFIG_PACKAGE_juci-igmpinfo is not set
	# CONFIG_PACKAGE_juci-inteno-multiwan is not set
	# CONFIG_PACKAGE_juci-inteno-router is not set
	# CONFIG_PACKAGE_juci-jquery-console=y
	# CONFIG_PACKAGE_juci-macdb is not set
	CONFIG_PACKAGE_juci-minidlna=y
	CONFIG_PACKAGE_juci-mod-status=y
	CONFIG_PACKAGE_juci-mod-system=y
	# CONFIG_PACKAGE_juci-natalie-dect is not set
	# CONFIG_PACKAGE_juci-netmode is not set
	CONFIG_PACKAGE_juci-network-netifd=y
	CONFIG_PACKAGE_juci-openwrt-wireless=y
	# CONFIG_PACKAGE_juci-router-openwrt is not set
	CONFIG_PACKAGE_juci-samba=y
	CONFIG_PACKAGE_juci-simple-gui=y
	CONFIG_PACKAGE_juci-snmp=y
	CONFIG_PACKAGE_juci-sysupgrade=y
	CONFIG_PACKAGE_juci-uhttpd=y
	CONFIG_PACKAGE_juci-upnp=y
	CONFIG_PACKAGE_juci-usb=y
	# CONFIG_PACKAGE_juci-utils is not set
	CONFIG_PACKAGE_juci-theme-inteno=y
	CONFIG_PACKAGE_juci=y

- BUILD!

Menus can be configured in /etc/config/juci. As a start you can use
juci.config.example and copy it to your router /etc/config/juci. Then you can
modify it to get the menus you want.  A better menu system is on the todo
list..

If you go to your router ip you should see the login screen. By default admin
user is used to login but if you don't have password set for admin user you
will not be able to login. So then go to the console and set password for admin
user or change the user used for logging in by editing /etc/config/rpcd and
then do /etc/init.d/rpcd restart.

JUCI also includes a nodejs server which you can do for local testing and for
forwarding jsonrpc calls to your router during testing (juci-local-server).

Good to know
------------

Addons can be developed on top of juci by creating package that installs js and
css files into the router /www folder and then runs juci-update at postinstall
(index.html is actually generated automatically).

In most cases you will never need to modify core juci code. If you need to
change behavior of some function, you can always override the public function
in javascript without having to modify the original implementation.

Juci uses modified version of uhttpd that can serve gz files with proper
content type based on actual gzipped content.

JUCI also uses modified versions of ubus and rpcd on openwrt which you can also
install from the feed (using -f option).

Backend Code
------------

Juci backend mostly consists of scripts that implement ubus functions which
become available to the gui code through json rpc. These scripts are simple
glue that juci uses to interact with the rest of the system. You can place
these scripts in ubus/ folder of your plugin. Each script should have a
globally unique name (preferably a name that identifies it as being part of a
specific plugin) and it will be placed into /usr/lib/ubus/juci folder on the
router.

All of these scripts are then managed by ubus-scriptd service on the router
which makes then available on ubus.

ubus-scriptd supports both batch scripts and services. Most of juci backend
tasks are usually batch scripts that become ubus objects.
