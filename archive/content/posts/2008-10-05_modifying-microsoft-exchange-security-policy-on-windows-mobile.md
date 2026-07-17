---
id: 190
title: Modifying Microsoft Exchange Security Policy on Windows Mobile
date: 2008-10-05T02:50:08
slug: modifying-microsoft-exchange-security-policy-on-windows-mobile
type: post
path: /2008/10/05/modifying-microsoft-exchange-security-policy-on-windows-mobile/
link: "https://jiehong.org/2008/10/05/modifying-microsoft-exchange-security-policy-on-windows-mobile/"
---

# Modifying Microsoft Exchange Security Policy on Windows Mobile

My story on why I decided to change the phone lock timeout.

When I first power on my HTC Touch Pro, I went through the start up wizard, it prompt me to set a phone lock pin and a timeout for activating the lock. I decided to go with 15mins, since I can change it later.

I decided to configure an Exchange profile on my Touch Pro for my office emails, since I have a Mobile Broadband plan with a 50GB data limit.

After the first day, I got pretty pissed off by the 15mins timeout. I tried changing it but it didn’t allow me to do that. I checked around and realise it’s actually a security policy which is pushed down by my corporate Exchange Server.

Firstly the 15mins timeout is too short, you don’t look at your phone every 10mins to see if you have any new SMS, missed calls or emails. So everytime when I wanted to make a call, reply a SMS, I have to enter my pin to unlock it.

Yes, I believe we should have security controls in place, it’s always a balance of Security and Usability. I am a working in the IT Security line 🙂 , but it’s too frustrating.

I searched around and I found this workaround. I very surprised the hack published in a [Microsoft blog](http://blogs.microsoft.co.il/blogs/tamir/archive/2007/12/28/how-to-disable-exchange-security-policy-for-windows-mobile-devices.aspx) ! Here’s the screen shot of the utility and you can download it [here](http://http://blogs.microsoft.co.il/files/folders/tamir/entry46249.aspx).

[![](/media/_missing.svg)](http://blogs.microsoft.co.il/files/folders/tamir/entry46249.aspx)

Finally, I didn’t disable the phone lock feature, I left it enabled as I did in all my previous phones. I just change the timeout to a more reasonable duration.

As you can see, you can disable the phone lock or modify the timeout duration. It actually modifies the value of several registry keys.

- Enable/Disable the Exchange security policy – HKLM\Security\Policies\00001023: 0 = Enabled; 1 = Disabled

- Inactivity time

- HKLM\Comm\Security\Policy\LASSD\AE\{50C13377-C66D-400C-889E-C316FC4AB374}\AEFrequencyType: 0 = No inactivity time; 1 = Activity time enable

- HKLM\Comm\Security\Policy\LASSD\AE\{50C13377-C66D-400C-889E-C316FC4AB374}\AEFrequencyValue: number of minutes before timeout

Remember, the security policy is there for a reason. You won’t want your phone to be picked up by somebody with malicous intent.
