---
layout: post
title: 'Code Share - Build Management Plugin, Unity'
date: '2014-04-11'
category:
  - note
author: Keiran Lovett
---

Unity is an amazing tool, it allows for rapid development and prototyping of game concepts, and is incredibly easy to pick up. After using it for a year though I had experimented little with creating extensions and grown tired of creating builds for my games manually. 

===

Having worked with a lot of friends in film, I picked up a lot of tips on naming conventions (yeah I know programmers are anal about it too but film students will plot your murder if you break a single convention). When working in group projects it is absolutely necessary to have a log of who's done what (bless you git), and better yet a constant understanding of which file is which. On previous projects I would simply build projects manually and go "Alrighty, this one is 1.0.3.4, because that file is 1.0.3.3", but really...its an extra step that I would neglect and ignore far too often. So to combat it I wrote a script that would streamline this effort and make sure everyone used it.

The result is a build manager that sits in the menu of Unity. When the user wants to build the project they click the platform type (in my case OSX), and the script automatically builds it in a folder appropriately named "Build", appending the version number of the game. Once thats done it appends the information to a log, to keep track of failed builds and embedded scenes in the builds. Simple, and effective. While its a rough and hacked together project done in a few hours, its easy enough to understand and extend.

In order to compress files I'm using a .dll from [SharpZipLib](http://icsharpcode.github.io/SharpZipLib/), its attached to the github repository but its better still to have the latest version.

Enjoy, and feel free to contribute!


<script src="http://gist-it.sudarmuthu.com/github/keiranlovett/Unity-Build-Manager-Plugin/blob/master/Assets/Editor/BuildTools.cs"></script>

[GitHub Link](https://github.com/keiranlovett/Unity-Build-Manager-Plugin)
