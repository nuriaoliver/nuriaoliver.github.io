---
title: Image Analogies
date: 2000-01-01
categories:
 - Computer Graphics
---

**(For more details look at
[Aaron Hertzman's](http://www.mrl.nyu.edu/~hertzman/)
[Image Analogies](http://www.mrl.nyu.edu/projects/image-analogies/lf)
web site at NYU)**

We present a new framework for processing images by example, called "image
analogies." Rather than attempting to program individual filters by hand, we
attempt to automatically learn filters from training data. For example, the
following figure demonstrates an image analogy used to learn a painting style:

|  |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- |
| 'Unfiltered' painting (A) | : | 'Filtered' painting (A') | :: | Input image (B) | : | Target image (B') |
| **A** |  | **A'** |  | **B** |  | **B'** |

The images on the left are training data; our system "learns" the
transformation from **A** to **A'**, and then applies that transformation
to **B** to get **B'**. In other words, we compute **B'**
to complete the analogy. (Only partial images are shown above; here are the
[full images](http://www.mrl.nyu.edu/projects/image-analogies/freud.html)).

Many examples and results are shown on these pages. For additional details of
the algorithm, please see the
[paper](http://www.mrl.nyu.edu/publications/image-analogies/).

### Applications

We applied the image analogies approach to several different problems:

* [Toy filters](http://www.mrl.nyu.edu/projects/image-analogies/tf.html),
  such as blurring or "embossing."
* [Texture
  synthesis](http://www.mrl.nyu.edu/projects/image-analogies/ts.html) from an example texture.
* [Super-resolution](http://www.mrl.nyu.edu/projects/image-analogies/sr.html), inferring a high-resolution image from a low-resolutinon
  source.
* [Texture
  transfer](http://www.mrl.nyu.edu/projects/image-analogies/tt.html), in which images are "texturized" with some arbitrary source
  texture.
* [Artistic filters](http://www.mrl.nyu.edu/projects/image-analogies/artistic.html), in which various drawing and painting styles, including
  oil, pastel, and pen-and-ink rendering, are synthesized based on scanned
  real-world examples.
* [Texture-by-numbers](http://www.mrl.nyu.edu/projects/image-analogies/tbn.html), in which realistic scences, composed of a variety of
  textures, are created using a simple "painting" interface.

Other uses of our software:

* [Flight simulator terrain](http://www.mrl.nyu.edu/projects/image-analogies/flightsim.html)

### Video

[Texture-by-numbers video](http://www.mrl.nyu.edu/projects/image-analogies/analogies.mpg) 25MB, Running time: 2:08. (Note: Windows Media
Player sometimes will only show the first minute if you directly play the movie;
save the movie to your hard drive to avoid this problem.)

### Software

The Image Analogies
[software](http://www.mrl.nyu.edu/projects/image-analogies/lf) is
available.

Paul Harrison's
[Resynthesizer](http://www.csse.monash.edu.au/~pfh/resynthesizer/)
GIMP plug-in does something similar, though the algorithm is different.

### Papers

[Image Analogies](http://www.mrl.nyu.edu/publications/image-analogies/)  
A. Hertzmann, C. Jacobs, N. Oliver, B. Curless, D. Salesin.  
*SIGGRAPH 2001 Conference Proceedings*.

[*Algorithms
for Rendering in Artistic Styles*](http://www.mrl.nyu.edu/publications/hertzmann-thesis/)  
A. Hertzmann. Ph.D thesis. New York University. May, 2001.

---


Copyright © 2001 Aaron Hertzmann, Charles E. Jacobs, Nuria Oliver, Brian
Curless, David H. Salesin