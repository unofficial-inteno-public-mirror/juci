#! /bin/sh

send_event() {
	if [ "$#" -eq 3 ]; then
		ubus send "$2" "{\"code\":\"$1\", \"status\":\"$3\" }"
		return "$?"
	fi
 	case "$1" in
		0)
			ubus send "$2" "{\"code\":\"$1\", \"status\":\"Success\"}"
			;;
		4)
			ubus send "$2" "{\"code\": \"$1\", \"status\":\"Network error\"}"
			;;
		6)
			ubus send "$2" "{\"code\": \"$1\", \"status\":\"Authentication error\"}"
			;;
		*)
			ubus send "$2" "{\"code\": \"$1\", \"status\":\"Unknown error\"}"
			;;
	esac
		return "$?"
}
print_help() {
	printf "Usage: $0 test|start [options] URL\n\n"
	printf "Options:\n\t-u|--user uname:\tset username for protected urls\n\t-p|--password passwd:\tset password for protected urls\n\t-s|--save:\t\tset this flag to save settings on upgrade\n\n"
}

run_test() {

[ "$USER" -a "$PASS" ] && wget -q --user="$USER" --password="$PASS" --spider $URL || wget -q --spider $URL

send_event "$?" "netupgrade.test"

}

start_download() {

[ "$USER" -a "$PASS" ] && wget -q --user="$USER" --password="$PASS" -O "$IMGPATH" "$URL" || wget -q -O "$IMGPATH" "$URL"

send_event $? "netupgrade.download_complete"

sysupgrade -T $IMGPATH && sysupgrade $([ "$SAVE" ] || echo -n) $IMGPATH 

a=$?

[ $a -eq 0 ] && ret="upgrade successful" || ret="upgrade failure"
send_event "$a" "netupgrade.sysupgrade_done" "$ret"

}

[ $# -lt 2 ] && print_help && return;

[ "$1" != "test" -a "$1" != "start" ] && print_help
METHOD=$1
shift

IMGPATH="/tmp/firmware.bin"
rm -f $IMGPAT

while [ $# -gt 1 ]
	do
	key="$1"

	case $key in
		-u | --user)
			USER="$2"
			shift
			;;
		-p | --password)
			PASS="$2"
			shift
			;;
		-s | --save)
			SAVE=1;
			;;
		*)   # unknown option
		;;
	esac
	shift
done
URL=$1

case "$METHOD" in
	start)
		 start_download
		 ;;
	test)
		run_test
		;;
	*)
		print_help
esac
return 0


