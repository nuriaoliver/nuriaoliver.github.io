---
title: Classifying T'ai Chi moves with a coupled hidden Markov model
redirect_from:
  - /chmm
  - /chmm/
shortTitle: "Coupled HMMs for T'ai Chi"
category: Human Behavior Modeling and Recognition
years: "1997"
description: "Coupled hidden Markov models for recognizing and classifying two-handed actions."
date: 1997-01-01
---

*Nuria Oliver, Matthew Brand and Alex Pentland — MIT Media Lab*

## Abstract

We present algorithms for coupling and training hidden Markov models (HMMs) to model interacting processes, and demonstrate their superiority to conventional HMMs in a vision task classifying two-handed actions. HMMs are perhaps the most successful framework in perceptual computing for modeling and classifying dynamic behaviors, because they offer dynamic time warping, a learning algorithm, and a clear Bayesian semantics. However, the Markovian framework makes strong restrictive assumptions about the system generating the signal — that it is a single process having a small number of states and an extremely limited state memory. The single-process model is often inappropriate for vision (and speech) applications, resulting in low ceilings on model performance. Coupled HMMs provide an efficient way to resolve many of these problems, and offer superior training speeds, model likelihoods, and robustness to initial conditions.

## Gesture Examples

Examples of gestures robustly classified by CHMMs:

- [Brush knee](lbk.mp4)
- [Cobra](lc.mp4)
- [Single whip](lsw.mp4)
