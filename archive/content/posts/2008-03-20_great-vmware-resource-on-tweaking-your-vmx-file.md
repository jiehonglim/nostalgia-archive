---
id: 88
title: Great VMware resource on tweaking your .vmx
date: 2008-03-20T00:18:02
slug: great-vmware-resource-on-tweaking-your-vmx-file
type: post
path: /2008/03/20/great-vmware-resource-on-tweaking-your-vmx-file/
link: "https://jiehong.org/2008/03/20/great-vmware-resource-on-tweaking-your-vmx-file/"
---

# Great VMware resource on tweaking your .vmx

I was looking for a way to force my VM to boot up with a specific date and time without going into the VM BIOS to change it every time I boot up.

I  just need a VM for testing and evaluating certain software or platforms but I don’t like re-building it when the licenses expires.

Especially when trial software always expires in like 15 or 30 days ? 7 for a particular secure os and 15 for a particular secure platform. 🙂

Here’s what I [found](http://sanbarrow.com/vmx/vmx-always-start-tonight.html) @ [http://sanbarrow.com/](http://sanbarrow.com/).

I will need to add the following lines to my xxx.vmx, so everytime the VM boots up, it resets it’s date and time to my liking.

> 

rtc.startTime = 1089395200

tools.syncTime = false

time.synchronize.continue = false

time.synchronize.restore = false

time.synchronize.resume.disk = false

time.synchronize.resume.memory = false

time.synchronize.shrink = false

Figuring the value for rtc clock ? A small application is available for download at the same site to calculate that value from dd/mm/yyyy hh:mm:ss.
