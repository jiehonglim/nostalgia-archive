---
id: 222
title: Increasing the performance of .Net 3.5 Apps
date: 2008-10-13T09:28:22
slug: increasing-the-performance-of-net-35-apps
type: post
path: /2008/10/13/increasing-the-performance-of-net-35-apps/
link: "https://jiehong.org/2008/10/13/increasing-the-performance-of-net-35-apps/"
---

# Increasing the performance of .Net 3.5 Apps

By default, HTC Touch Pro comes with .Net Compact Framework 2, I have to install 3.5 to get certain applications working. Here’s a tweak to enable 3.5 by default instead of 2.

What you need to do:

1. Install NetCF3.5 on your ppc.

2. Open a registry editor, I use Reso Regsitry Editor

3. Goto HKLM\Software\Microsoft\.NETCompactFramework (this is usually the first entry

4. When you open this you’ll see all the .NET installed version change the DWORD value of 2.0.7045.00 from 1 to 0

5. Chang ethe DWORD value of 3.5.7283.00 from 0 to 1.

6. Reboot

7.Viola! you have a faster PPC

Source: [http://forum.xda-developers.com/showthread.php?t=373721](http://forum.xda-developers.com/showthread.php?t=373721)
