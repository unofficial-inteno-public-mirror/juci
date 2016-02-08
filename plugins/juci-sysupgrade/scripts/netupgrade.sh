#! /bin/sh

send_event() {
 	case $1 in
		0)
			ubus send "$2" "{\"code\":$1, \"status\":\"Success\"}"
			;;
		4)
			ubus send "$2" "{\"code\": $1, \"status\":\"Network error\"}"
			;;
		6)
			ubus send "$2" "{\"code\": $1, \"status\":\"Authentication error\"}"
			;;
		*)
			ubus send "$2" "{\"code\": $1, \"status\":\"Unknown error\"}"
			;;
	esac
	return $1
}
print_help() {
	printf "Usage: netupgrade.sh test|run [options] URL\n\n"
	printf "Options:\n\t-u|--user uname:\tset username for protected urls\n\t-p|--password passwd:\tset password for protected urls\n\t-s|--save:\t\tset this flag to save settings on upgrade\n\n"
}

[ $# -lt 2 ] && print_help && return;

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

[ "$USER" -a "$PASS" ] && wget -q --user="$USER" --password="$PASS" --spider $URL || wget -q --spider $URL

case $? in
	0)
		echo "Success";
		;;
	4)
		echo "Network error";
		return;
		;;
	6)
		echo "Authentication error";
		return;
		;;
	*)
		echo "Unknown error";
		return;
		;;
esac

[ "$USER" -a "$PASS" ] && wget -q --user="$USER" --password="$PASS" -O $IMGPATH $URL || wget -q -O $IMGPATH $URL

case $? in
	0)
		echo "Success";
		;;
	4)
		echo "Network error";
		return;
		;;
	6)
		echo "Authentication error";
		return;
		;;
	*)
		echo "Unknown error";
		return;
		;;
esac

sysupgrade -T $IMGPATH && sysupgrade $([ "$SAVE" ] || echo -n) $IMGPATH 

echo $?
