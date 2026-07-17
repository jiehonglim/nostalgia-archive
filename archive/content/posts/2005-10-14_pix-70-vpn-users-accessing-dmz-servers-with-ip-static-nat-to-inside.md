---
id: 7
title: PIX 7.0 VPN users accessing DMZ Servers with IP Static NAT to Inside
date: 2005-10-14T09:50:14
slug: pix-70-vpn-users-accessing-dmz-servers-with-ip-static-nat-to-inside
type: post
path: /2005/10/14/pix-70-vpn-users-accessing-dmz-servers-with-ip-static-nat-to-inside/
link: "https://jiehong.org/2005/10/14/pix-70-vpn-users-accessing-dmz-servers-with-ip-static-nat-to-inside/"
---

# PIX 7.0 VPN users accessing DMZ Servers with IP Static NAT to Inside

Another issue I have with Cisco PIX 7.0.

I have a server connecting to the PIX DMZ interface with the IP of 172.17.1.1. This server is translated to an Inside IP 10.1.1.1 and to an Outside internet routable IP.

When VPN users connect from outside, they want to access the DMZ server via the 10.1.1.1 IP not the 172 IP.

They are able to connect to any host on the inside but unable to connect to the translated IP.

This is the static statement.

static (dmz,inside) 10.1.1.1 172.17.1.1 netmask 255.255.255.255

My Networks

Inside : 10.1.1.0/24

DMZ : 172.17.1.0/24

VPN Pool : 192.168.0.0/24

I posted this question at [Cisco NetPro forum](http://forums.cisco.com/eforum/servlet/NetProf?page=netprof&forum=Security&topic=Firewalling&CommCmd=MB%3Fcmd%3Ddisplay_location%26location%3D.1dd96104), and I got this reply,

“static (dmz,inside) 10.1.1.1 172.17.1.1 netmask 255.255.255.255

as the command sugguested, the translation is between the dmz and the inside interfaces. it only works when the packet originated from the inside, not the vpn clinet from the outside.”

So I concluded that the VPN clients are connecting from the outside interface and the static command i used is only for host on the inside interface.

I still wondering is there a way of writing my ACL, traffic from outside to dmz have a different translation but I have already translated dmz to outside with another static command. So… help?
