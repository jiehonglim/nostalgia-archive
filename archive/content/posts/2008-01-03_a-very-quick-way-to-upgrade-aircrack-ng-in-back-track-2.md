---
id: 86
title: Quick way to upgrade aircrack-ng in BackTrack
date: 2008-01-03T01:12:16
slug: a-very-quick-way-to-upgrade-aircrack-ng-in-back-track-2
type: post
path: /2008/01/03/a-very-quick-way-to-upgrade-aircrack-ng-in-back-track-2/
link: "https://jiehong.org/2008/01/03/a-very-quick-way-to-upgrade-aircrack-ng-in-back-track-2/"
---

# Quick way to upgrade aircrack-ng in BackTrack

If you installed Back Track 2 into your hdd and if you want to update the aircrack-ng suite, here’s the commands to do so.

Download the source [here](http://download.aircrack-ng.org/aircrack-ng-0.9.1.tar.gz).

tar -zxvf aircrack-ng-0.9.1.tar.gz

cd aircrack-ng-0.9.1

make

make -B install

make install will throw out some errors, so just do it with a “-B”

-B, –always-make            Unconditionally make all targets.
