---
id: 24
title: Crashed IDE Harddisk, Low Level Formating, Secure Harddisk Wipe/Shred
date: 2006-04-24T08:34:17
slug: crashed-ide-harddisk-low-level-formating-secure-harddisk-wipeshred
type: post
path: /2006/04/24/crashed-ide-harddisk-low-level-formating-secure-harddisk-wipeshred/
link: "https://jiehong.org/2006/04/24/crashed-ide-harddisk-low-level-formating-secure-harddisk-wipeshred/"
---

# Crashed IDE Harddisk, Low Level Formating, Secure Harddisk Wipe/Shred

When I plugged in my USB harddisk to my PC, to my horror, I started to hear some kind of clicking sound and the harddisk is trying to spin up and stop repeatively.

So I looked at my system’s dmesg messages and realised my HDD is a goner. My OS is unable to mount the vfat partition.

Remove the 2.5in harddisk from my USB casing and connected it back into my IBM X21, inserted an Ubuntu 5.10 LiveCD. Once Gnome desktop came up, I tried to mount the partition again, this time is successful !

I managed to save most of my data except 2 ISO files which I suspected they are residing on the harddisk bad sectors. I ran the harddisk diagnostic tool, guess what, bad blocks were detected.

Googled around and found a [site](http://www.ariolic.com/activesmart/low-level-format.html) with most of the different harddisk vendors’ Low Level Formatting tools. At the same time, I decided to “nuke” my harddisk.

[Darik’s Boot and Nuke](http://dban.sourceforge.net/) Create the floppy boot disk, boot, select your harddisk, select desired drive wiping routines, Nuke it !

Supported Wipe Methods

Quick Erase

Canadian RCMP TSSIT OPS-II Standard Wipe

American DoD 5220-22.M Standard Wipe

Gutmann Wipe

PRNG Stream Wipe

Most Linux distro comes with shred as well, most Live CDs will have them.

# shred -n 2 -z -v /dev/hda1

-n : to overwrite N times instead of the default (25)

-z : To write with zeros
