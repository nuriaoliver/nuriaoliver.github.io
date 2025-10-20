---
title: "Where is the food? Reinforcement Learning in a Maze World"
---

**Nuria Oliver   
MIT Media Laboratory; 20 Ames St., Cambridge, MA 02139  
**

Introduction
------------

Reinforcement learning is the problem faced by an agent that learns its behavior
through  *trial-and-error* interactions with its environment. The agent
is connected to its environment via *perception* and  *action*. On each step of interaction the agent
receives as input  *i*, some indication of the current state, *s*, of the environment; the agent then chooses an action  *a*, to
generate as output, following some  *action selection criterium*. This
action changes the state of the environment and the value of this state
transition is communicated to the agent through a scalar *reinforcement
signal* or  *reward*. The agent's behavior should choose those action
that tend to increase the  **long-run sum of rewards**, i. e. it should find
the  **optimal policy** or mapping of states to actions. It can learn to do
this over time by systematic trial and error, guided by a wide variety of
algorithms, some of which this paper:

1. Implements and
2. compares when performing the same task.

Two important assumptions of the reinforcement algorithms are:

* a  *stationary* environment, i.e. the probabilities of
  making state transitions or receiving a specific reward do not change over
  time,
* the entire state space can be  *enumerated* and  *stored*
  in memory.

Therefore, in order to be able to apply this approach in a learning problem, I
need to find the right environment where to test the system. In this project I
have chosen a  **maze world**. Such a world consists of a grid made of an
arbitrary number of squares of width and length. Each square of this grid can
have one of two different values:

1. either a wall, that prevents the agent to move,
2. or a free way or empty square where the agent can put itself.

There are  **two** special grid positions:

1. the starting position, from where the agent will start its search
   towards the
2. the goal (food).

The task is to navigate through the maze from the starting point to the goal.
From each state (maze position) there are four possible actions: NORTH, SOUTH,
EAST and WEST, which change the state accordingly except when such movement
would put the agent in a wall or outside the maze, in which case it doesn't move
(the state doesn't change). Reward is zero for all transitions except for those
into the goal state, for which it is 100000.

This kind of world is limited enough to allow us to enumerate all the possible
states, but, at the same time, rich enough to allow us to evaluate the
performance of the algorithms in different situations. In the current
implementation the user can not only decide the size of the maze, but also
design the wall positions and the starting and goal points. The  *learning*
and  *action selection policies*
as well as the different  *learning parameters* can also be interactively
determined by the user.

System's structure
------------------

The system consists of two different parts:

### User interface

The user interface is a TCL/Tk interface whose main window is shown in figure 1.

**Figure 1:** Main window of MazeWorld user interface.

### The learning system

All the learning algorithms, as well as the world representation are implemented
in C++ code.

Given that the interface controls the running process, when describing the
interface we will also describe the learning system connected to it.

The main window of the program allows the user to:

1. Design the maze that the system should learn and
2. Determine some parameters of the learning process, as figures
   [2](mazeworld.md) to [5](mazeworld.md) represent.

   **Figure 2:** Action Selection Policy window interface.

   **Figure 3:** Running Parameters Selection window interface.

   **Figure 4:** Learning Strategy Selection window interface.

   **Figure 5:** Learning Parameters Selection window interface.

   1. **Action Selection Policy (exploitation versus exploration):**
      There is a fundamental tradeoff between exploitation of the knowledge
      that our agent already has about the world and the exploration of new
      paths in order to reach the goal. The  *action selection* policy
      will determine whether the agent is more inclined to make use of its
      knowledge or to explore the world. The policies that are implemented in
      the system are:
      1. *Greedy strategy*: i.e., to always choose the action with the
         highest estimated payoff. The flaw is that early unlucky sampling might
         indicate that the best action's reward is less than the reward obtained from
         a suboptimal action.
      2. *Exploration Bonus*: which is a greedy technique combined with
         a factor to encourage exploration named the  *exploration bonus*:
         each state-action pair is given this exploration bonus proportional to an
         uncertainty measure, , being  the number of time steps that have
         elapsed since action **a**
         was tried in state **x**. The policy is thus to select the action that
         maximizes the expected reward (greedy algorithm) plus , where  is a
         small positive parameter.
      3. *Radomized strategies*: Two randomized strategies have been
         developed:
         * A greedy strategy combined with a purely random action selection that
           happens with probability p, and
         * a  *Boltzmann exploration* technique, in which the expected
           reward for taking action **a**,  is used to choose an action
           probabilistically, according to the distribution

           where the  *temperature* parameter **T** is decreased over time to
           decrease exploration.
   2. **Running Parameters:** Some debugging flags as well as other
      options can be determined for each run:
      * *Debug* outputs a lot of information about how the learning
        process is taking place.
      * *Debug draw* draws the paths found by the agent towards the
        food step by step.
      * *Debug Hyp* outputs information about the hypothetical
        experiences in the family of Dyna architectures.
      * *Do Learning Curves* turns on/off the optional plot of the
        learning curves (steps per trial vs. trials).
      * *Dump Results to File* for saving the values of the learning
        curves onto a file.
   3. **Learning Strategy:** Four different variations of reinforcement
      learning have been implemented:
      1. *Q-learning*, where the learning rule is given by:
      2. *DynaQ-*, which extends the basic Q-learning by including
         an internal  *world model*, defined as something that behaves like
         the world: given an state and an action it outputs a prediction of the
         resultant reward and next state. In addition to the usual learning step of
         Q-learning, there are also **k** learning steps using the model in place
         of the world and predicted outcomes rather than real ones. Therefore, for
         each real experience with the world, many hypothetical experiences generated
         by the world model are processed and learned from.
      3. *DynaQ+*, which is designed to be able to solve the *shortcut problem*, i.e. the case in which after having learnt the
         optimal policy for reaching the goal, the world changes in such a way that
         there is a better path to the goal. To help on this problem, *DynaQ+* uses an additional memory structure to keep track of the degree
         of uncertainty about each component of the model. This uncertainty measure
         is called an  *exploration bonus*. For real experiences, the policy
         is to select the action that maximizes  and the Q-learning equation is
         also modified so that equation [2](mazeworld.md) becomes:
3. **Learning Parameters:** The parameters that can be tuned in the
   learning equations are:
   * *Error,* , for bounding the performance of the greedy final
     action selection policy as a function of the  *Bellman residual* of
     the current value function. The convergence criterium says that if the
     maximum difference between two successive value functions is less than a
     given error, **Error**, then the value of the greedy policy differs from
     the value of the optimal policy by no more than  at any state. This
     provides an effective stopping algorithm.
   * *Number of hypothetical experiences, **k*** in the Dyna
     architectures.
   * *Multiplicative factor,*   for the exploration bonus
     action selection policy.
   * *New knowledge transfer factor,*
   * *Learning factor,* .

Measuring the
learning performance: stopping criteria
-----------------------------------------------------

When should the agent stop exploring the world and decide that the optimal path
found until this moment is the optimal one? There are different criteria for
deciding whether the actual solution is satisfactory enough or not. The most
immediate is an  *eventual convergence to optimal*, which is not a good
measure for the learning performance, because it is not useful in practical
terms. Other factors such as the learning rate are more important in determining
the system's performance. Therefore, our system applies a
 *speed of convergence to optimality* as the criterium to decide the
goodness of the solution. Two variations of this phylosophy are implemented:

1. Level of performance after a given number of time steps, that can
   be interactively tuned by the user. This is a completely heuristic value and
   it is difficult to assess when this value is satisfactory enough: obviously,
   the larger the number of time steps, the surer convergence to the optimal
   path is, but the longer the run time is as well as the number of iterations.
2. Speed of convergence to near optimality, determined by a maximum
   accepted error in the solution, which is also tunable by the user.

From both strategies, the second one is more powerful than the first one in the
sense that it provides a better criterium for stopping the learning process: the
solution chosen is the optimal one but the number of iterations is much lower
than with the first strategy.

Results
and Conclusions
-----------------------

Given the flexibility that the user interface provides, each learning strategy
can be run with different action selection policies and different learning
parameters. The most important conclusions that must be pointed out are:

1. **Action Selection Policy:** A purely greedy action selection
   policy is not convenient because there is a significant probability for the
   agent to select a  *suboptimal path* and not to discover the optimal
   one, as figure [6](mazeworld.md) illustrates:

   **Figure 6:** Suboptimal path selection under greedy action
   selection with 39 trials and 710202 backups.

   The same situation with all the rest of action selection policies provides
   the  *optimal path towards the goal*, shown if figure
   [7](mazeworld.md).

   **Figure 7:** Optimal path selection under greedy action
   selection with 35 trials and 295702 backups.

   The difference between the different policies lies on the number of trials
   and backups performed in each one, as table [1](mazeworld.md) shows:

   **Table 1:** Sensitivity to Action Selection Policy.

   Another important aspect is the  *generalization capability* of our
   agent, i.e. it's ability to find an new goal from the same or a different
   starting point and in the same or a different world. With this respect, the
   number of trials until convergence is important, because even though the
   system might find the optimal solution for the particular world
   configuration, if it finds it too early (after too few trials), it won't be
   able to generalize to different situations. Our system, with the convergence
   criterium described above, performs equally well for all the strategies when
   generalizing to several situations different to the one learnt. Figures [8](mazeworld.md)
   to [12](mazeworld.md) illustrate this fact.

   **Figure 8:** Optimal path learnt with Q-learning and within 15
   trials and 28178 backups.

   **Figure 9:** Optimal path found with a different starting
   point.

   **Figure 10:** Optimal path learnt with DynaQ- and exploration
   bonus action selection (6666 trials and 166449 backups).

   **Figure 11:** Optimal path found with a different starting
   point.

   **Figure 12:** Optimal path learnt with DynaQ- and exploration
   bonus action selection (9005 trials and 168661 backups).
2. **Learning Strategy:** The action selection policy controls
   the exploitation vs. exploration tradeoff which determines how well the
   agent generalizes for other cases and not only for the particular starting
   and goal positions that have been learnt. The learning strategies, on the
   other hand, determine how the experience that the agent acquires when
   interacting with the world is added to its value function. The most relevant
   differences between Q-learning and the Dyna architecture are:
   * the  **learning rate** of the optimal policy: the Dyna systems learn
     much  *faster* the optimal solution than the Q-learning approach. The
     prize to pay is a considerably larger number of backups, i.e. a much higher
     computational load. The system learns much faster than the pure
     reinforcement learning system, because in this latter each trial adds only
     one step to the policy, whereas in the former for each trial it adds **k+1**
     steps to the policy.
   * more  **flexibility** and  *adaptability* thanks to the
     internal world's representation that the agent builds while exploring the
     world.
3. **Learning Parameters:**
   1. **Learning rate,** : The higher the learning rate, the faster the
      system learns the optimal policy. In the experiments  was set to 1.
   2. **Spread of previous state,** : The system's sensitivity with
      respect to  is similar to its sensitivity with respect to : the lower 
      is the slower the learning rate is, as table [2](mazeworld.md) and figure [13](mazeworld.md) show.

      **Table 2:** Learning rates.

      **Figure 13:** Learning rates with different gamma values.
   3. **Number of hypothetical experiences, k**: the larger the
      number of hypothetical experiences the faster the learning rate is but the
      larger the number of backups is (see figure [14](mazeworld.md)). In the analysis of the influence of **k** the accepted error
      with respect to the optimal path was set to
      **2** instead of **1**, given that the convergence is much faster even
      though the number of backups is much larger too.

      **Figure 14:** Learning rates with different k values.

*Nuria Oliver Ramirez   
Wed May 22 20:42:58 EDT 1996*