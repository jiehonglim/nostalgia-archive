---
id: 27
title: Secure your passwords, files, drives.
date: 2006-05-12T14:33:16
slug: secure-your-passwords-files-drives
type: post
path: /2006/05/12/secure-your-passwords-files-drives/
link: "https://jiehong.org/2006/05/12/secure-your-passwords-files-drives/"
---

# Secure your passwords, files, drives.

I have a problem which most of us are facing.

How many usernames and passwords are you keeping track of ? Or even the email address that you used to create that account with ? Admit it, most of us have more than 1 email address. 🙂

So how do you keep track of them ? Save into a spreadsheet ? Are they secured ? Most spreadsheets built-in protection are not good enough.

Introducing [KeePass](http://keepass.sourceforge.net/) (Windows), [KeePassX](http://keepass.berlios.de/en/) (Linux), [PasswordSafe](http://passwordsafe.sourceforge.net/) (Windows) and [MyPasswordSafe](http://www.semanticgap.com/myps/) (Linux).

They all have the same purpose, keeping your usernames and password under a master password. KeePass database is encrypted with AES, Twofish and your master password hashed with SHA256. My/PasswordSafe didn’t provided detailed enough information regarding security except they use Blowfish for the database encryption.

Now how about securing personal files and those password databases ? Try [TrueCrypt](http://www.truecrypt.org/). This is available for both Linux(CLI) and Windows.

TrueCrypt will create a file eg, 1024MB in your filesystem. You can mount it as a drive in Windows or a folder in Linux. Any files written into it is protected with encryption algorithms of your own choice.

Well, to conclude, “A chain is only as strong as the weakest link”.

Having a strong encryption protection won’t help unless you use a complex passphrase containing alpha-numerics and symbols, ensure that the length is at least 20 characters. 🙂

You can generate a strong passphrase at [GRC](https://www.grc.com/passwords).

Now, don’t you go writing it down on a Post-It note and pasting it on your monitor.
