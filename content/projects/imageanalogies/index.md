---
title: Image Analogies
redirect_from:
  - /imageanalogies
  - /imageanalogies/
date: 2000-01-01
category: Computer Graphics
years: "2000"
careerPeriod: mit
description: "Learns image filters by example to create new visual transformations automatically."
---

## Overview

We present a framework for processing images by example, called "image analogies." Rather than programming individual filters by hand, we automatically learn filters from training data. Given an unfiltered source image A, its filtered version A', and a new input image B, the system learns the transformation from A to A' and applies it to B to produce the analogous output B'.

## Applications

- **Toy filters** — blurring, embossing, and other simple effects
- **Texture synthesis** — generating new textures from a single example
- **Super-resolution** — inferring a high-resolution image from a low-resolution source
- **Texture transfer** — applying arbitrary source textures to target images
- **Artistic filters** — synthesizing oil, pastel, and pen-and-ink rendering styles from scanned real-world examples
- **Texture-by-numbers** — creating realistic scenes using a simple painting interface

## Publications

[Image Analogies](/papers/analogies.pdf)
A. Hertzmann, C. Jacobs, N. Oliver, B. Curless, D. Salesin.
*SIGGRAPH 2001 Conference Proceedings*.

[Algorithms for Rendering in Artistic Styles](http://www.mrl.nyu.edu/publications/hertzmann-thesis/)
A. Hertzmann. Ph.D. thesis, New York University, May 2001.

## Videos

- [Texture-by-numbers demo](analogies.mp4) (6.2 MB, 2:08)
