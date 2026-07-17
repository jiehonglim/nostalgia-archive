---
id: 238
title: Cold Boot Attacks on Encryption Keys
date: 2008-10-19T01:47:17
slug: cold-boot-attacks-on-encryption-keys
type: post
path: /2008/10/19/cold-boot-attacks-on-encryption-keys/
link: "https://jiehong.org/2008/10/19/cold-boot-attacks-on-encryption-keys/"
---

# Cold Boot Attacks on Encryption Keys

I just read this [article](http://hacknmod.com/hack/hack-encryption-keys-using-compressed-air/) on using compressed air to cool a memory chip so it will retain data even power is been cut off.

A video can be found [here](http://citp.princeton.edu/memory/) on the process and on why colder memory chip will retain data longer. By retaining the data, you can do a dump of the data and extract the cryptographic keys. They were able to extract keys for BitLocker, TrueCrypt, FileVault and dm-crypt.

The attack is not exploiting weakness of the encryption software but due to the fact that the keys have to be stored in memory.  Encrypting the key in memory don’t really help, you still need to store that key that encrypts somewhere !
