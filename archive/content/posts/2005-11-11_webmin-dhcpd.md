---
id: 10
title: webmin & DHCPD
date: 2005-11-11T00:00:31
slug: webmin-dhcpd
type: post
path: /2005/11/11/webmin-dhcpd/
link: "https://jiehong.org/2005/11/11/webmin-dhcpd/"
---

# webmin & DHCPD

Finally, I got both my boxes fixed. So I was happily connecting them together with a SC cable…. yah yah.. It’s only 15cm apart but still it’s a 1Gbps Fibre Channel link 😀

I decided to use dhcp for that link, since I haven’t tried configuring dhcpd before.

After configuring dhcpd on webmin, I tried starting it. The button still shows “Start Server”.

syslog presents:

Nov  9 19:53:24 localhost dhcpd: No subnet declaration for eth0 (10.x.x.x).

Nov  9 19:53:24 localhost dhcpd: Please write a subnet declaration in your dhcpd.conf file for the

Nov  9 19:53:24 localhost dhcpd: network segment to which interface eth0 is attached.

Nov  9 19:53:24 localhost dhcpd: exiting.

wtf, I actually configured for eth3 in the options. So i check /etc/dhcpd.conf, no mention of eth0. Got more pissed after starting the server several times, then I checked /etc/init.d/dhcp..

#Defaults

INTERFACES=”eth0″

So, ok. now I know the reason, changed it.. SAME ERROR !

This time i saw /etc/defaults/dhcp, added INTERFACES=”eth3″

Now it works. Installing Ubuntu on my 2nd box..
