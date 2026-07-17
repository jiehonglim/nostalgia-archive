---
id: 18
title: Parsing Windows Event Logs
date: 2006-04-07T09:51:17
slug: parsing-windows-event-logs
type: post
path: /2006/04/07/parsing-windows-event-logs/
link: "https://jiehong.org/2006/04/07/parsing-windows-event-logs/"
---

# Parsing Windows Event Logs

I had a major problem. I have to “analyze” Windows event logs from several Microsoft Windows Servers in a centralised location.

Procedures:

Open Event Viewer

Browse to folder

Open hostname-year-month-day.evt

Filter Errors and Failure Audits

Repeat for the rest of the servers

I was lucky to stumble upon the [Log Parser](http://www.logparser.com/), a command-line which allows SQL queries to be run against log files and dump the required results into simple csv files.

“C:\program files\log parser 2.2\logparser.exe” -i:evt “select EventLog, TimeGenerated, EventID, EventTypeName, EventCategoryName, SourceName, Strings, ComputerName, SID, Message into %2 from %1 where EventTypeName like ‘Error%%'” -o:csv -resolveSIDs:on -direction:BW

Where %1 refers to your source and %2 to your destination.

Quoted from my friend “If you have to click on the same thing more than 2 times, automate it.”
