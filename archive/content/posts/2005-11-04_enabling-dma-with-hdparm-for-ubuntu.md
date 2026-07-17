---
id: 8
title: Enabling DMA with hdparm for Ubuntu
date: 2005-11-04T00:00:28
slug: enabling-dma-with-hdparm-for-ubuntu
type: post
path: /2005/11/04/enabling-dma-with-hdparm-for-ubuntu/
link: "https://jiehong.org/2005/11/04/enabling-dma-with-hdparm-for-ubuntu/"
---

# Enabling DMA with hdparm for Ubuntu

With reference to the [wiki](https://wiki.ubuntu.com/DMA) at ubuntu.com,

Edit /etc/modules:

For an intel cpu put the lines

piix

ide-core

above the line ide-cd

For an amd cpu put the line

amd74xx

above ide-cd

For a VIA Chipset put

via82cxxx

above ide-cd

my hdparm parameters

hdparm -c1 -d1 -X70 /dev/hda

-c1 enables 32bit IO

-d1 enables DMA

-X70 sets DMA to UDMA6

that’s all folks.
