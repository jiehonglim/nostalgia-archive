---
id: 262
title: How to use PHP5 if CPanel is configured for PHP4 by default
date: 2008-11-02T23:50:52
slug: how-to-use-php5-if-cpanel-is-configured-for-php4-by-default
type: post
path: /2008/11/02/how-to-use-php5-if-cpanel-is-configured-for-php4-by-default/
link: "https://jiehong.org/2008/11/02/how-to-use-php5-if-cpanel-is-configured-for-php4-by-default/"
---

# How to use PHP5 if CPanel is configured for PHP4 by default

The older version of CPanel version 10 does not have the option for changing to PHP5. So what you need to do is to add the following line to your .htaccess file.

“AddType application/x-httpd-php5 .php”
