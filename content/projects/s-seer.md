---
title: "S-Seer: Guiding Perceptual Sensing and Analysis with Value of Information (EVI)" 
---


Abstract
--------

In this project, we explore the use of expected value of information (EVI) to
control the use and analysis of data coming from multiple perceptual sensors
used in the [SEER](seer.md) system for identifying office
activities. SEER uses a layering of HMMs (LHMMs) at different temporal
granularities for diagnosing situations in offices from real-time streams of
evidence (video, audio and computer interactions). We review the overall
architecture of the legacy SEER system, describe how we integrated the EVI
analyses, and show how EVI computations endow SEER's descendant, named *Selective SEER* or just S-SEER, with the ability to balance computation
required for perceptual analysis with the discriminatory power of the sensors.
Finally, we report on several experiments to probe the value of using EVI in the
system.

Related Papers
--------------

['Selective Perception Policies for Guiding
Sensing and Computation in Multimodal Systems: A Comparative Analysis'](cviuSpecIssue-S-Seer.pdf),
Nuria Oliver & Eric Horvitz. Submitted to CVIU Journal.

['Layered Representations for Learning and
Inferring Office Activity from Multiple Sensory Channels'](oliver_cviuSpecIssue.pdf), Nuria Oliver,
Ashutosh Garg & Eric Horvitz. To appear in CVIU Journal.

![](icmi_logo.gif)     
['Selective Perception Policies for Guiding Sensing and
Computation in Multimodal Systems: A Comparative Analysis'](icmi2003.pdf), Nuria Oliver &
Eric Horvitz. Paper presented at ICMI 2003 (Vancouver, BC, Canada, November
2003)

[![](assets/seer/icmi_logo.jpg)](assets/seer/11_oliver.pdf)     ['Layered Representations for Human Activity Recognition'](assets/seer/olivern_layered.pdf), Nuria Oliver, Eric
Horvitz & Ashutosh Garg. Paper presented at ICMI 2002 (Pittsburgh, October 2002)

![](assets/seer/cvpr2001logo.jpg)
[Paper presented at CVPR2001](assets/seer/11_oliver.pdf) (Cues in
Communication Workshop), Nuria Oliver, Eric Horvitz & Ashutosh Garg

Videos
------

[Video showing S-SEER in action as of June 2004](s-seer.wmv)

[![](assets/seer/IJCAI-01blacklogo.jpg)](assets/seer/video/cvpr2001video_short.mpg)![](assets/seer/fig/IJCAI-01_black.jpg)
[Live demonstration](assets/seer/video/cvpr2001video_short.mpg) during
[Bill Gates](http://www.microsoft.com/billgates/default.asp)
[invited speech](http://www.microsoft.com/PressPass/press/2001/Aug01/08-06ArtificialIntelligencePR.asp) at IJCAI2001