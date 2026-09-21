---
aliases: "/mihmms"
title: "MIHMMs: Mutual Information Hidden Markov Models"
redirect_from:
  - /mihmms
  - /mihmms/
category: Machine Learning
years: "2003"
description: "Introduces mutual-information hidden Markov models for richer sequence modeling."
date: 2003-01-01
---

## Abstract

This paper proposes a new family of Hidden Markov Models (HMMs) named Mutual Information Hidden Markov Models (MIHMMs). MIHMMs have the same graphical structure as HMMs. However, the objective function being optimized is not the joint likelihood of the observations and the hidden states — it is a convex combination of the mutual information between the hidden states and the observations, and the likelihood of the observations and the states. We present both theoretical and practical motivations for this objective function, derive the parameter estimation equations for both discrete and continuous observation cases, and illustrate the superiority of our approach in several classification tasks, comparing against standard Maximum Likelihood HMMs on synthetic and real data. MIHMMs are a powerful tool for solving many of the problems associated with HMMs in classification and clustering settings.

## Publications

[MIHMMs: Mutual Information Hidden Markov Models](/papers/icml2002.pdf)
N. Oliver and A. Garg.
*ICML 2002 Conference Proceedings*.
