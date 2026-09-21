---
title: "Where is the food? Reinforcement Learning in a Maze World"
redirect_from:
  - /mazeworld
  - /mazeworld/
shortTitle: "Reinforcement Learning in a Maze"
category: Machine Learning
years: "1997"
description: "Compares reinforcement-learning algorithms in a configurable maze-world environment."
date: 1997-01-01
---

*Nuria Oliver — MIT Media Lab*

## Overview

This project implements and compares several reinforcement learning algorithms in a maze-world domain. An agent navigates a configurable grid maze from a starting position to a goal, receiving a reward upon reaching the goal. The task is to learn an optimal policy over time through trial and error. The system is built as an interactive application in which the user can design the maze, set learning parameters, and compare algorithm performance.

The two key assumptions of the implemented algorithms are a stationary environment (fixed transition probabilities and rewards) and an enumerable state space. The maze world satisfies both, while remaining complex enough to meaningfully differentiate algorithm performance.

## Algorithms Implemented

- **Q-learning** — updates state-action values based on the immediate reward plus the estimated value of the best next action.
- **DynaQ−** — extends Q-learning with an internal world model; for each real experience, *k* hypothetical experiences are generated and used to update the value function, dramatically improving learning speed.
- **DynaQ+** — extends DynaQ− to solve the *shortcut problem* (adapting when a better path to the goal becomes available after the initial policy is learned) using an exploration bonus that encourages re-visiting state-action pairs that have not been tried recently.

## Action Selection Policies

- **Greedy** — always selects the action with the highest estimated value. Prone to suboptimal convergence from early unlucky samples.
- **Exploration bonus** — greedy selection augmented by an uncertainty term proportional to time elapsed since the action was last tried in that state.
- **ε-greedy** — greedy with probability 1−ε, uniformly random with probability ε.
- **Boltzmann exploration** — selects actions probabilistically according to a softmax distribution over estimated values, with temperature decreasing over time to reduce exploration.

## Results and Conclusions

**Action selection policy:** Pure greedy selection has a significant risk of converging to a suboptimal path. All other policies reliably find the optimal path, differing mainly in the number of trials and backups required. The system generalizes well to different starting points and maze configurations under all strategies.

**Learning strategy:** Dyna architectures learn the optimal policy much faster than pure Q-learning because each real experience generates *k* additional hypothetical updates. The trade-off is a substantially higher computational load. DynaQ+ further handles environmental changes, at the cost of additional memory to track state-action recency.

**Learning parameters:** Higher learning rates and larger values of *k* accelerate convergence but increase the number of backups required. A convergence criterion based on the Bellman residual provides an effective stopping rule.

## System

The user interface is implemented in Tcl/Tk. The user can interactively design the maze (wall positions, start, and goal), choose the action selection policy, set learning parameters, and enable real-time visualization of the learned paths and learning curves. All learning algorithms are implemented in C++.
