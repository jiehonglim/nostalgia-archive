---
id: 5
title: L2TP over IPsec
date: 2005-10-09T00:00:14
slug: l2tp-over-ipsec
type: post
path: /2005/10/09/l2tp-over-ipsec/
link: "https://jiehong.org/2005/10/09/l2tp-over-ipsec/"
---

# L2TP over IPsec

Configuring L2TP over IPSec for both Cisco PIX and Cisco Router on the Customer side.

Tricky things uncovered.

According to the documentation provided on how the L2TP is to be configured:

vpdn enable

!

vpdn-group 1

accept-dialin

protocol l2tp

virtual-template 1

terminate-from hostname BB-GGSN1

local name CPE-L2TP-Router

l2tp tunnel password 0 secret

!

interface Virtual-Template1

ip unnumbered FastEthernet0

peer default ip address pool l2tp-pool01

ppp authentication pap

!

ip local pool l2tp-pool01 10.9.2.201 10.9.2.220

For the curious souls like me, how the hell the router knows who’s BB-GGSN1.. so I added:

ip host BB-GGSN2 202.x.x.x2

ip host BB-GGSN1 202.x.x.x1

So the router is done but I still wondering, who’s going to auth all PAP request ?

PIX as follows:

access-list 90 permit ip host 203.x.x.x host 202.x.x.x6

nat (inside) 0 access-list 90

sysopt connection permit-ipsec

sysopt connection permit-l2tp

crypto ipsec transform-set transformset-strong esp-3des esp-sha-hmac

crypto ipsec transform-set transformset-strong mode transport

crypto dynamic-map dyna 20 match address 90

crypto dynamic-map dyna 20 set transform-set transformset-strong

crypto map site-map 10 ipsec-isakmp dynamic dyna

crypto map site-map interface outside

isakmp enable outside

isakmp key ******** address 202.x.x.x6 netmask 255.255.255.255

isakmp identity address

isakmp policy 10 authentication pre-share

isakmp policy 10 encryption 3des

isakmp policy 10 hash sha

isakmp policy 10 group 2

isakmp policy 10 lifetime 86400

The tunnel just don’t get up.

I did a debug.

debug crypto ipsec

debug crypto isakmp

The debug shows proxy identities mis-matched, the error code is IKMP_ERR_NO_RETRANS

I poke around with the error and change my access-list address. So I realised I had a typo and it causes the SA negotiation to fail.

access-list 90 permit ip host 203.X.X.X host 202.X.X.X1

access-list 90 permit ip host 203.X.X.X host 202.X.X.X2

This ACL not only tells what traffic needed to be protected by IPSec but somehow it identify the peers on both side of the tunnel’s end point. I have to read up on this as this is kind of new to me. Usually site to site configuration always have both network address for the ACL.

So far, the tunnel seems to be up. I have yet to test the VPN tunnels as the user can’t seems to access the provider’s network at this moment.

Both the show statement shows positive results.

show crypto ipsec sa

show crypto isakmp sa

I’m still curious, I didn’t configured any radius server to auth the PAP users.

This is my first post for documentation.

Lengthy.

Useful Links

[Cisco Explaination on L2TP](http://www.cisco.com/warp/public/cc/pd/iosw/tech/l2pro_tc.htm)

[Cisco Guide to Configuring Site to Site IPSec for PIX](http://www.cisco.com/en/US/tech/tk583/tk372/technologies_configuration_example09186a00800ef796.shtml)
