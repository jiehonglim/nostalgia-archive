---
id: 87
title: To backup a Non-Data DVD
date: 2008-01-08T20:46:54
slug: to-backup-a-non-data-dvd
type: post
path: /2008/01/08/to-backup-a-non-data-dvd/
link: "https://jiehong.org/2008/01/08/to-backup-a-non-data-dvd/"
---

# To backup a Non-Data DVD

Well, if you have some DVDs that you will like to backup, here are the steps to do it.

Note: For non-encrypted DVDs, meaning like personal home videos, non-commerical created DVDs, etc.. 🙂

Step 1:

dvdbackup -M -i /dev/dvd -o ./outputdir/

-M tells it to make a full backup, there are other parameters to backup selective chapters.

dvdbackup will create the DVD folder structure under ./outputdir/<volume-name>

Step 2:

mkisofs -dvd-video -o dvd.iso ./outputdir/<volume-name>
