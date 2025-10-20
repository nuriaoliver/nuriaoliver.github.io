---
title: 3D Modeling of Human Lip Motion
date: 1997-05-17
---



Sumit Basu, Nuria Oliver and Alex Pentland  
Vision and Modeling Group, MIT Media Lab  
Cambridge, MA 02139-1130
----------------------------------------------------------------------------------------------------------------

### Abstract

We present a 3D model of human lips and develop a framework for
training it from real data. We also develop a new method for tracking
the lips and estimating their 3D pose from 2D video data using this
model. The model starts off with generic physics specified with the
finite element method and ``learns'' the correct physics through
observations. The model's physics allow physically-based
regularization between sparse observation points and the resulting set
of deformations are used to derive the correct physical modes of the
model. We demonstrate how the model can be used to accurately
reconstruct 3D lip shape from 2D data, and then apply our tracking
method to reconstruct 3D lip shape from unmarked video data (i.e., no
lipstick or special markers). The resulting model and analysis method
can be applied at any pose to robustly estimate and synthesize the lip
shape.

![](dataflow.gif)


---

Last revised 17may97

Nuria Oliver / MIT Media Lab