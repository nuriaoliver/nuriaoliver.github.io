---
title: "SWISH: Semantic Analysis of Window Titles and Switching History"
date: 2006-01-01
---

Abstract
--------

Information workers are often involved in multiple tasks and activities that
they must perform in parallel or in rapid succession. In consequence, task
management itself becomes yet another task that information workers need to
perform in order to get the rest of their work done. Recognition of this problem
has led to research on task management systems, which can help by allowing fast
task switching, fast task resumption, and automatic task identification. In this
paper we focus on the latter: we tackle the problem of automatically detecting
the tasks that the user is involved in, by identifying which of the windows on
the user's desktop are related to each other. The underlying assumption is that
windows that belong to the same task share some common properties with one
another that we can detect from data. We will refer to this problem as the *task assignment*  problem.

To address this problem, we have built a prototype named
**Swish** that: (1) constantly monitors users' desktop activities using a
stream of windows events; (2) logs and processes this raw event stream, and (3)
implements two criteria of window "relatedness'', namely the semantic similarity
of their titles, and the temporal closeness in their access patterns.

We have validated **Swish** with 4 hours of user data, obtaining task
classification accuracies of about **70/%**.

We are planning to include **Swish** in a number of intelligent user
interfaces.

Figure 1. SWISH'es interface
----------------------------

Related Papers
--------------

[SWISH: Semantic Analysis of Window Titles and
Switching History](iui2006-oliver.pdf),  Nuria Oliver, Greg Smith, Chintan Thakkar and Arun
C. Surendran. Proceed. of IUI 2006

Videos
------