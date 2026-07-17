---
id: 6
title: Multiple Use of ACL for PDM
date: 2005-10-14T00:00:28
slug: multiple-use-of-acl-for-pdm
type: post
path: /2005/10/14/multiple-use-of-acl-for-pdm/
link: "https://jiehong.org/2005/10/14/multiple-use-of-acl-for-pdm/"
---

# Multiple Use of ACL for PDM

access-list 90 permit ip host 203.X.X.X host 202.X.X.X1

access-list 90 permit ip host 203.X.X.X host 202.X.X.X2

nat (inside) 0 access-list 90

crypto dynamic-map dyna 20 match address 90

Guess what.. PDM won’t work with the above commands. The error I got was: “PDM do not support multiple uses of access list”

oohh.. man. I created the same ACL again but with another name and use it for the crypto.
