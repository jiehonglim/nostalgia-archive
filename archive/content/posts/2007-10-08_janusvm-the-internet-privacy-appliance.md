---
id: 80
title: JanusVM – The Internet Privacy Appliance
date: 2007-10-08T22:49:51
slug: janusvm-the-internet-privacy-appliance
type: post
path: /2007/10/08/janusvm-the-internet-privacy-appliance/
link: "https://jiehong.org/2007/10/08/janusvm-the-internet-privacy-appliance/"
---

# JanusVM – The Internet Privacy Appliance

I was trying out [JanusVM](http://janusvm.peertech.org/) in my VMware server.  It’s a linux based OS with this few key components, [openVPN](http://openvpn.net/), [Squid](http://www.squid-cache.org/), [privoxy](http://www.privoxy.org/) and [Tor](http://tor.eff.org/), packaged neatly into a VMware “appliance”.

Basically it provides a layer of security and privacy for most TCP based applications, like IM, web browsing, etc, even DNS requests are passed through Tor. Most importantly, it provides you with access to sites that are filtered off by your ISP transparent proxies.

[Tor](http://tor.eff.org/) allows your traffic to be re-route all around the internet anonymously via a complex network of virtual tunnels. An overview of Tor can be found [here](http://tor.eff.org/overview.html.en) and a detailed FAQ on Onion Routers [here](http://wiki.noreply.org/noreply/TheOnionRouter/TorFAQ).

My blog entry today is: how to enable your JanusVM to work in a corporate network whereby your firewall blocks most of the outgoing ports except http and https.

You can tell Tor to only use the ports that your firewall permits by adding the following to your torrc configuration file.

> 

FascistFirewall 1

ReachableDirAddresses *:80

ReachableORAddresses *:443

Update:

The latest beta version of Tor uses the following instead of the above

ReachableAddresses *:80
