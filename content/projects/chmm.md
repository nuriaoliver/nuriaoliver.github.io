---
title: Classifying T'ai Chi moves with a coupled hidden Markov model
---

Nuria Oliver, Matthew Brand and Alex Pentland  
Vision and Modeling Group, MIT Media Lab  

Cambridge, MA 02139-1130
-------------------------------------------------------------------------------------------------------------------

### Abstract

We present algorithms for coupling and training hidden Markov models (HMMs) to
model interacting processes, and demonstrate their superiority to conventional
HMMs in a vision task classifying two-handed actions. HMMs are perhaps the most
successful framework in perceptual computing for modeling and classifying
dynamic behaviors, because they offer dynamic time warping, a learning
algorithm, and a clear Bayesian semantics. However, the Markovian framework
makes strong restrictive assumptions about the system generating the
signal---that it is a single process having a small number of states and an
extremely limited state memory. The single-process model is often inappropriate
for vision (and speech) applications, resulting in low ceilings on model
performance. Coupled HMMs provide an efficient way to resolve many of these
problems, and offer superior training speeds, model likelihoods, and robustness
to initial conditions. 

---

Examples of gestures robustly classified by CHMMs:

* [brush knee](lbk.mpg)
* [cobra](lc.mpg)
* [single whip](lsw.mpg)

---

And here is the data (taichiData.tar.gz) that I used for the experimental
results:
["Taichi Data"](ftp://whitechapel.media.mit.edu/pub/nuria/taichiData.tar.gz)


---

Last revised 27nov96

Nuria Oliver/ Microsoft Research

[Matthew Brand](http://www.merl.com/people/brand) / MERL 