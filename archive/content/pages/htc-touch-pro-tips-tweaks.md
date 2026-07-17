---
id: 112
title: HTC Touch Pro Tips & Tweaks
date: 2008-09-30T11:01:30
slug: htc-touch-pro-tips-tweaks
type: page
path: /pages/htc-touch-pro-tips-tweaks/
link: "https://jiehong.org/htc-touch-pro-tips-tweaks/"
---

# HTC Touch Pro Tips & Tweaks

Putting together a list of Tips and Tweaks for HTC Touch Pro. Gathered from forum sources like [PPC SG](http://www.ppcsg.com/index.php?showforum=16) and [HWZ](http://forums.hardwarezone.com.sg/forumdisplay.php?f=212)

–

Disabling Touch Flo Dialer – This tweak will help to reduce the 1-2s lag when there’s an incoming phone. Using [Advanced Configuration Tool](http://jiehong.org/blog/free-useful-htc-touch-pro-applications/), Under Phone, change “Phone Skin” to disabled

–

Changing the Battery Icons – The [hack](http://forum.xda-developers.com/showthread.php?t=424926) will present your battery level in percentage rather than bars in the default. The .cab installation didn’t work for me, I downloaded and replaced the phcanOverbmp.dll and import the FInix VGA Battery and Network Icons.reg manually.

–

Boost Touch Flo 3D Performance – Using [Advanced Configuration Tool](http://jiehong.org/blog/free-useful-htc-touch-pro-applications/), Under Performance, change “File System Cache” to “8MB” and “File System Filter Cache” to “131072 sectors”

–

Boost Touch Flo 3D Performance – Under HKLM\System\Storagemanager\Fatfs, change key value of  “Cachesize” from “16384” to “32768”

–

Boost Touch Flo 3D Scrolling Speed – Using [Advanced Configuration Tool](http://jiehong.org/blog/free-useful-htc-touch-pro-applications/), Under Performance, change “Glyhp Cache” to “16384” or “32768”

–

Opera Tweak – Download this [opera.ini](http://jiehong.org/blog/wp-content/uploads/opera.zip), If you have connection problems when you have both MSN and Opera running together and copy it to “\Windows\Opera9\”

–

Removing Operator Startup and Shutdown logo – under HKLM\Software\HTC\HTCAnimation, remove key value of “StartupGif”, “StartupWav”, “ShutdownGif” and “ShutdownWav”

–

Disabling AutoKill – if you have this problem of applications closing by themselves, you can disable AutoKill under HKCU\Software\HTC\TaskManager, change key value of “EnableAutoKill” to “0”

–

Changing Auto kill Memory Threshold – if you do not wish to disable AutoKill, you can adjust the free memory threshold before AutoKill gets activated, under HKCU\Software\HTC\TaskManager, change key value of “EnableAutoKill” to 1, change key value of “MemoryThreshold” from Hex 06E000000 (Dec 115343360) to something lower

–

Enabling more Camera Modes –

Enable GPS photo: Under HKLM\SOFTWARE\HTC\Camera\P10, change the key value of “enabled” from “0” to “1”

Enable ‘Burst’: HKLM\SOFTWARE\HTC\Camera\P6, change the key value of “enabled” from “0” to “1”, keep button pressed down to take more pictures

Enable ‘Sport’: HKLM\SOFTWARE\HTC\Camera\P8, change the key value of “enabled” from “0” to “1”, takes 5 pictures in quick succession

Enable ‘Video Share’: HKLM\SOFTWARE\HTC\Camera\P9, change the key value of “enabled” from “0” to “1”

–

For ringtones, you can place the file in “\My Documents\My Ringtones\” or “\Windows\Rings\” folder.

For SMS tones, you have to place the file in “\Windows\” folder.

–

You can use Ctrl-A, Ctrl-X, Ctrl-C, Ctrl-V when you are editting a message but I find it challenging to do that with 2 thumbs.
