---
slug: humanbehavior
title: "A Bayesian Computer Vision System for Modeling Human Interactions"
---

Nuria Oliver, Barbara Rosario and Alex Pentland

Abstract
--------

In [this paper](icvs99.pdf)
we describe a real-time computer vision and machine learning system for modeling
and recognizing human behaviors in a visual surveillance task. The system is
particularly concerned with detecting when interactions between people occur,
and classifying the type of interaction. Examples of interesting interaction
behaviors include following another person, altering one's path to meet another,
and so forth.

Our system combines top-down with bottom-up information in a closed feedback
loop, with both components employing a statistical Bayesian approach. We propose
and compare two different state-based learning architectures, namely HMMs and
CHMMs, for modeling behaviors and interactions. The CHMM model is shown to work
much more efficiently and accurately.

Finally, a synthetic agent training system is used to develop a priori models
for recognizing human behaviors and interactions. We demonstrate the ability to
use these a priori models to accurately classify real human behaviors and
interactions with no additional tuning or training.

Related Papers
--------------

![](cvpr98.gif) CVPR98 Workshop on Interpretation of Visual
Motion Santa Barbara. June 1998  
[A
Bayesian Computer Vision System for Recognizing Human Interactions](ftp://whitechapel.media.mit.edu/pub/tech-reports/TR-459.ps.Z)

![](nips-logo.gif) NIPS98 Denver (Colorado). December 1998  
[Graphical Models for Recognizing Human Interactions](nips98.pdf)

![](icvs99.gif) ICVS99 Gran Canaria. Spain. January 1999  
[A Bayesian Computer Vision System for Modeling Human Interactions](icvs99.pdf)

![](agents-logo.GIF) Autonomous Agents 99. Seattle. May 1999

[A Synthetic Agent System for Bayesian Modeling of Human Interactions](aa99.pdf)

Videos
------

Here are some examples of the interactions that our system recognizes as well as
the video interpretation of the interacions by the system. On the bottom right
corner of each .mpg movie you'll see a label, indicating what is happening in
terms of simple actions. Each of these labels corresponds to one state in our
CHMMs models.

![](follow1.gif)[Follow](follow2_title.mpeg)

[![](meet2.gif)
Meet, talk and continue together](meet1_title.mpeg)

[![](meet_go_on1_title.gif)
Meet, talk and go on separately](meet_go_on1_title.mpeg)

[![](chdir.gif)
Change direction, meet, talk and go on separately](ch_dir32_1.mpeg)

Last revised Dec98

Nuria Oliver / Microsoft Research