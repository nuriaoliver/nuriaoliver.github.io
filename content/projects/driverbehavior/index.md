---
slug: driverbehavior
title: Graphical Models for Driver Behavior Recognition and Prediction in a SmartCar
---

Nuria Oliver and [Alex Pentland](http://www.media.mit.edu/~pentland)

Abstract
--------

I have developed a SmartCar testbed platform: a real-time data acquisition and
playback system and a machine learning --dynamical graphical models-- framework
for modeling and recognizing driver maneuvers at a tactical level, with
particular focus on how contextual information affects the driver's performance.
The SmartCar's perceptual input is multi-modal: four video signals capture the
surrounding traffic, the driver's head position and the driver's viewpoint; and
a real-time data acquisition system records the car's brake, gear, steering
wheel angle, speed and acceleration throttle signals. We have carried out
driving experiments with the instrumented car over a period of 2 months. Over 70
drivers have driven the SmartCar for 1.25 hours in the greater Boston area.
Dynamical Graphical models, HMMs and potentially extensions (CHMMs), have been
trained using the experimental driving data to create models of seven different
driver maneuvers: passing, changing lanes right and left, turning right and
left, starting and stopping. These models are essential to build more realistic
automated cars in car simulators, to improve the human-machine interface in
driver assistance systems, to prevent potential dangerous situations and to
create more realistic automated cars in car simulators.

Related Papers
--------------

![](iv2000_revab2t.gif)
Intelligent Vehicles 2000. Detroit. Michigan. October 2000

### [A Graphical Models for Driver Behavior Recognition in a SmartCar](iv2000.pdf)

![](or00_small.gif)
AeroSense 2000. Enhanced and Synthetic Vision 2000. Orlando. April 2000

### [A Driver Behavior Recognition and Prediction in a SmartCar](spie2000.pdf)

Videos
------

The following mpeg movie illustrates a passing maneuver with the interpretation
that the system provides. On the bottom right corner of the .mpg movie you'll
see a label, indicating what is happening in terms of simple actions. Each of
these labels corresponds to one state in our HMM models.

### [Passing in the highway](pass_video_title.mpg)

#### Last revised April00

Nuria Oliver / Microsoft Research