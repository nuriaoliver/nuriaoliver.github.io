---
title: "DyPERS: Dynamic Personal Enhanced Reality System"
categories: 
 - Wearable, Mobile and Urban Computing
date: 1999-01-01
---

![](crawling_baby.gif)

### Nuria Oliver Tony Jebara Bernt Schiele Alex Pentland

##### [[email protected]](cdn-cgi/l/email-protection.md) [[email protected]](http://www.media.mit.edu/~jebara) [[email protected]](http://www.media.mit.edu/~bernt) [[email protected]](http://www.media.mit.edu/~sandy)

---

Abstract
--------

DyPERS is a 'Dynamic Personal Enhanced Reality System' which uses augmented
reality and computer vision to overlay video and audio clips relevant for the
user on top on real real objects that the user is paying attention to. The
system is wearable and adaptively learns an audio and video memory and what
everyday objects to associate it with and to evoke or playback in the future.

Introduction
------------

DyPERS is a 'Dynamic Personal Enhanced Reality System' which uses augmented
reality and computer vision to overlay video and audio clips relevant for the
user on top on real real objects that the user is paying attention to. The user
wears a HUD (Heads-Up Display) with a small mounted ELMO CCD QN401E color camera
on board (as in the
[Stochasticks](ftp://whitechapel.media.mit.edu/pub/tech-reports/TR-439-ABSTRACT.html)system) and a wireless microphone. A
[generic and
trainable object recognition system](http://pandora.imag.fr/Prima/schiele/Pubs/pubs.html#phd97)processes images from the camera as the
user turns his head to view an object of interest. It then automatically
highlights important objects as previously specified by the user. The user shows
the system objects of interest ahead of time and then will associate video and
audio clips that the user records to those objects. DyPERS can be considered a
**videographic memory**.

System Architecture
-------------------

The three main components of DyPERS are:

1. **Audio visual memory**, which accumulates personal memories and
   associates them to objects
2. **Generic trainable object recognition** system using computer vision as
   input
3. **Wearable system** with audio visual input/output capabilities and
   interface.

Audio Visual Memory
-------------------

Audio and Video are recorded and played back in real time as the following
images show:

![](ftie1.gif) ![](ftie2.gif)

Visual Learning
---------------

The generic object recognition system uses computer vision. It is invariant
to scaling, translation, rotation, small lighting changes and deformations of
the object so that it can usually be recognized in different situations (see
figure below). Some of its features are:

1. Learns user-relevant visual cues
2. Builds a statistical representation of the objects
3. Groups sample images into objects and several objects into a audio-visual
   association

![](ftie3.gif) ![](ftie4.gif)

***Recognition of the tie***

Hardware
--------

The system is full wearable but needs offline processing which is done via
wireless links. Its important hardware components are:

1. ELMO CCD QN401E color camera
2. Wireless 3-button mouse
3. Wireless microphone
4. Glasstron heads-up display and headphones
5. SGI O2
6. Wavecom Jr transmitter/receiver units

Interface
---------

The interface paradigm is **Record and Associate**: just by using two
buttons of a wireless mouse the user selects when to record some video and audio
in real time (see Figure below). A third button (garbage) is for negative
feedback to signal to the system that the association it learned is incorrect
and to delete it.

![](mouse.gif)

Applications
------------

Some examples of objects or situations that DyPERS can recognize and augment
are:

1. **Clock**: Every time DyPERS recognizes a wall clock or the watch of the
   user it displays a video with the user's schedule for the day.
2. **Demo poster**: Just by looking at a poster of a demo of the lab, DyPERS
   will show a short video and audio with the demo associated to the poster.
3. **Multilingual Teacher**: The user could record the name of several
   objects in several languages. During recognition DyPERS would speak the name of
   the learnt objects in the different languages, teaching the user how to say
   them.
4. **Stuffed Animal**: A story about the animal could be recorded in such a
   way that everytime the kid looks at the animal DyPERS triggers the story
   associated to it.
5. **Augmented Storyteller**: The parents could associate the pictures on
   each page of their children's book with the story about them. Later the kid
   would listen to the story just by looking at the pages of the book.
6. **KeyPad Door Lock**: By recording the keypad door combination with an
   image of the keypad, DyPERS would remind the user of the right combination when
   the user would look at the keypad.
7. **Business Card**: A video and audio clip of our conversation with an
   important person would be associated with his or her business card. Then
   everytime the user would look at the business card the video and audio would
   appear and remind the user about whom the business card belongs to.
8. **Origami**: DyPERS could teach the user how to create different origami
   objects by playing video and audio about how to make them.
9. **Specific Machinery**: Instructions about how to change pieces of some
   appliance, or how to use it would be associated with the appliance itself and
   played back when looking at the object. For example, instructions on how to
   change the ink cartridges of the printer and the printer.
10. **CD Cover or Poster of a Movie**: The CD cover of some music or the
    poster of a movie would be associated with some clips of the music contained on
    the CD or a small preview of the movie. When the user would look at the CD cover
    or at the poster DyPERS would play the audio and video associated with it, given
    to the user a good cue of what type of music or movie is.
11. **Blind People**: Important objects could be associated with some audio
    information in such a way that DyPERS could describe what visually impaired
    persons are seeing in a personalized and private way.
12. **Medicine**: The user could record the directions of the doctor about
    how to take a specific medicine with the box/containter of it. When necessary
    just by looking at the medicine DyPERS would play the instructions automatically
    to the user.
13. **Name/Logo of a specific store**, associated with the nearest location
    of it, its schedule and which items the user would be interested in purchasing
    there.
14. **Art objects (images, paintings, sculptures)** and some explanationsn
    about them, the location and other relevant information.

The output consists of superimposesd video and audio on the real video
images.

The system is dynamic, personal and trainable.

Video
-----

[![](dypers.jpg)](dypers.mpg)

---

Bibliography:
-------------

1. *["DyPERS: Dynamic Personal Enhanced Reality
   System"](dypers_icvs99.pdf)*
   . Bernt Schiele, Nuria Oliver, Tony Jebara and Alex Pentland. Intl. Conference
   on Computer Vision Systems, ICVS'99 Jan1999. Gran Canaria, Spain.
2. *["Sensory Augmented Computing: Wearing the Museum's
   Guide"](micro4.pdf).*Bernt Schiele, Tony Jebara and Nuria Oliver. IEEE Micro Journal.
   2001.
3. *"Stochasticks:Augmenting the Billiards Experience with Probabilistic
   Vision and Wearable Computers"*. Tony Jebara, Cyrus Eyster, Josh Weaver,
   Thad Starner and Alex Pentland. Proc. of the First Intl. Symposium on Wearable
   Computers. Oct 1997. Cambridge, MA.
4. *"Object Recognition using multidimensional receptive field histograms."
   Bernt Schiele. PhD thesis. July 97. I.N.P. Grenoble. France*