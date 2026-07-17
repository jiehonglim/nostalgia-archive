---
id: 12
title: RPC Dynamic Ports
date: 2005-12-14T00:00:28
slug: rpc-dynamic-ports
type: post
path: /2005/12/14/rpc-dynamic-ports/
link: "https://jiehong.org/2005/12/14/rpc-dynamic-ports/"
---

# RPC Dynamic Ports

By default, Microsoft RPC allocate ports from 1024 – 65535.

To restrict them to 5000 – 5100, Use the Registry entries below.

— cut here —

Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Rpc\Internet]

“Ports”=hex(7):35,00,30,00,30,00,30,00,2d,00,35,00,31,00,30,00,30,00,00,00,00,  00

“PortsInternetAvailable”=”Y”

“UseInternetPorts”=”Y”

— cut here
