# Interactive Audio Convolution Visualizer

## A Web App for Teaching Convolution, Impulse Response, and LTI Systems

## 1. Core Idea

The goal is to build a small web application that lets students **hear convolution**.

In the Signals and Systems course, students learn that for an LTI system,

[
y(t)=x(t)*h(t)
]

or, in discrete time,

[
y[n]=x[n]*h[n].
]

Here, (x) is the input signal, (h) is the impulse response of the system, and (y) is the output. The app should make this idea tangible:

> Upload or record a short audio signal, choose an impulse response, convolve them, then listen to the output.

The student should be able to hear how the impulse response changes the sound. This turns convolution from a symbolic formula into a physical experience.

---

## 2. Pedagogical Motivation

In class, we introduced convolution in two stages.

First, convolution appeared as a mathematical operation: reflect, shift, multiply, and add. Then we connected it to LTI systems: if we know the response of a system to an impulse, then we can predict the response to any input by convolution.

This app should serve exactly that bridge.

The student should feel:

1. “I uploaded an input signal.”
2. “I chose a system by choosing its impulse response.”
3. “The app computed the output by convolution.”
4. “Now I can hear what that LTI system does.”

So the app is not just an audio effects tool. It is a teaching tool for:

* impulse response,
* convolution,
* LTI systems,
* echo,
* reverberation,
* stability,
* causality,
* and the meaning of (h(t)).

---

## 3. Important Conceptual Correction

A clean repeated echo does not come from a continuous unit step impulse response.

If we choose

[
h[n]=u[n],
]

then convolution with (h[n]) gives a cumulative sum:

[
y[n]=\sum_{k=-\infty}^{n}x[k].
]

In audio, this behaves more like an integrator. It can create a muddy or drifting sound and may become unstable or clip easily.

However, clean repeated echoes come from an impulse response that has separated spikes:

[
h[n]=\delta[n]+\alpha\delta[n-D]+\alpha^2\delta[n-2D]+\cdots
]

where:

* (D) is the delay between echoes,
* (\alpha) is the fraction of sound strength preserved after each echo,
* (0<\alpha<1).

This produces:

[
\text{hello} + \alpha(\text{delayed hello}) + \alpha^2(\text{more delayed hello})+\cdots
]

That is exactly the sound intuition we want for echoes.

So the app should include both:

* **mathematical impulse responses**, such as (u[n]), (\alpha^n u[n]), etc.;
* **audio-friendly impulse responses**, such as delayed echo trains.

This distinction should be explicitly taught inside the app.

---

## 4. Main User Flow

The user opens the app and sees four main steps.

### Step 1: Choose or upload input audio

The user can either:

* upload a short `.wav`, `.mp3`, or `.webm` file,
* record directly in the browser,
* or choose a built-in sample such as “hello”, “clap”, “short beep”, or “impulse click”.

The recommended input duration is 1–3 seconds.

The app displays:

* the waveform of the input,
* duration,
* sample rate,
* and a play button for the original audio.

---

### Step 2: Choose an impulse response

The user selects an impulse response from a menu.

The app displays:

* the formula for (h),
* a plot of the impulse response,
* and a short physical interpretation.

Example impulse responses:

#### A. Identity system

[
h[n]=\delta[n]
]

Meaning:

> The system does nothing. The output is the input.

Expected sound:

> The uploaded audio sounds unchanged.

---

#### B. Single delay

[
h[n]=\delta[n-D]
]

Meaning:

> The system delays the sound by (D) samples or (D) seconds.

Expected sound:

> The same audio plays later.

User controls:

* delay time (D) in milliseconds.

---

#### C. Two-tap echo

[
h[n]=\delta[n]+\alpha\delta[n-D]
]

Meaning:

> The original sound is heard, then one weaker echo appears after delay (D).

Expected sound:

> “hello” followed by a quieter “hello”.

User controls:

* delay time (D),
* echo strength (\alpha).

---

#### D. Repeated echo train

[
h[n]=\sum_{m=0}^{M}\alpha^m\delta[n-mD]
]

Meaning:

> The sound reflects repeatedly, losing strength each time.

Expected sound:

> hello, hello, hello, hello, fading away.

User controls:

* delay time (D),
* decay factor (\alpha),
* number of echoes (M).

This is the best option for connecting to the room-echo story from the lecture.

---

#### E. Exponential decay impulse response

[
h[n]=\alpha^n u[n],
\qquad 0<\alpha<1.
]

Meaning:

> The system remembers the input and slowly forgets it.

Expected sound:

> A smeared, reverberant, decaying tail rather than separate echoes.

User controls:

* (\alpha),
* impulse response length.

Important teaching note:

> This is not a sequence of separated echoes unless the impulse response has separated spikes. It is a dense memory tail.

---

#### F. Unit step impulse response

[
h[n]=u[n]
]

Meaning:

> The system accumulates the input over time.

Expected sound:

> Can become muddy, distorted, or clipped. This is useful to demonstrate why stability matters.

Important warning:

> This impulse response is not absolutely summable. Therefore, it is not BIBO stable in discrete time.

User controls:

* truncation length,
* normalization on/off.

---

#### G. Finite rectangular impulse response

[
h[n]=
\begin{cases}
1, & 0\le n\le L,\
0, & \text{otherwise}.
\end{cases}
]

Meaning:

> The system averages or smears the signal over a short window.

Expected sound:

> The sound becomes blurred or smoothed.

User controls:

* window length (L),
* normalization.

---

#### H. Real room impulse response

The user can choose or upload a real room impulse response.

Meaning:

> The app applies the acoustic signature of a room to the uploaded audio.

Expected sound:

> Dry audio becomes reverberant, as if played in a room, hall, or tunnel.

---

## 5. Step 3: Compute the convolution

After choosing (x) and (h), the app computes:

[
y[n]=\sum_k x[k]h[n-k].
]

For audio, everything is stored as sampled discrete-time signals. So even if we teach continuous-time convolution, the actual computation in the browser uses discrete samples.

The app should show:

* input waveform (x[n]),
* impulse response (h[n]),
* output waveform (y[n]),
* and optionally a short animation showing (h[n-k]) sliding across (x[k]).

There should be a large button:

> Convolve and listen

---

## 6. Step 4: Listen and compare

After convolution, the app should provide three play buttons:

* Play input (x)
* Play impulse response (h), if audible
* Play output (y=x*h)

It should also provide:

* normalize output toggle,
* gain slider,
* download processed audio,
* reset button.

A useful feature:

> A/B toggle: switch quickly between original and convolved audio.

This helps students hear what the impulse response did.

---

## 7. Visual Design

The app should have a clean classroom-friendly interface.

Suggested layout:

### Top row

* Input audio panel
* Impulse response panel
* Output audio panel

### Middle row

* Waveform plots
* Formula display
* Parameter sliders

### Bottom row

* Explanation card
* Play buttons
* Download button

Each impulse response option should have a short explanation:

Example:

[
h[n]=\delta[n]+\alpha\delta[n-D]
]

Explanation:

> This means the system immediately outputs the original sound, then outputs a weaker delayed copy after (D) milliseconds.

For the exponential response:

[
h[n]=\alpha^n u[n]
]

Explanation:

> The system has memory. Each future sample keeps a fraction (\alpha) of the previous response.

---

## 8. Teaching Modes

The app should have two modes.

### Mode 1: Audio Mode

This mode prioritizes sound quality and intuitive listening.

Use impulse responses such as:

* delayed echoes,
* exponential reverb tail,
* real room impulse responses,
* smoothing filters.

The student hears the output.

---

### Mode 2: Theory Mode

This mode prioritizes mathematical interpretation.

Use impulse responses such as:

* (\delta[n]),
* (u[n]),
* (\alpha^n u[n]),
* finite rectangular windows,
* left-sided signals,
* noncausal examples.

The app explains whether the system is:

* causal,
* stable,
* both,
* or neither.

This mode may intentionally produce strange sounds, because the goal is understanding rather than audio beauty.

---

## 9. Stability Demonstrations

This app can beautifully demonstrate stability.

For an LTI system, stability depends on whether the impulse response is absolutely summable:

[
\sum_{n=-\infty}^{\infty}|h[n]|<\infty.
]

The app can show this visually.

### Stable example

[
h[n]=\alpha^n u[n],\qquad 0<\alpha<1.
]

Then:

[
\sum_{n=0}^{\infty}\alpha^n=\frac{1}{1-\alpha}<\infty.
]

So it is stable.

Audio interpretation:

> The echo tail eventually dies.

---

### Unstable example

[
h[n]=u[n].
]

Then:

[
\sum_{n=0}^{\infty}1=\infty.
]

So it is not stable.

Audio interpretation:

> The system keeps accumulating and can overreact.

The app should show a warning:

> This impulse response is theoretically unstable. The app will truncate it for playback, but mathematically the infinite system is unstable.

This is a very powerful teaching point.

---

## 10. Causality Demonstrations

The app can also show causality.

For a discrete-time LTI system:

[
h[n]=0 \quad \text{for all } n<0
]

means the system is causal.

Examples:

### Causal

[
h[n]=\alpha^n u[n]
]

The response starts at (n=0), so the system does not respond before the impulse.

### Noncausal

[
h[n]=\alpha^{-n}u[-n]
]

This has nonzero values before (n=0), so the system responds before the impulse arrives.

In the app, noncausal impulse responses can be shown visually, but playback should be explained carefully. Since real-time systems cannot respond before the input arrives, noncausal effects require offline processing or look-ahead.

---

## 11. Technical Feasibility

This project is fully feasible in a browser.

Recommended stack:

* React
* TypeScript
* Web Audio API
* Canvas or SVG for waveforms
* Optional: Tailwind or Chakra UI
* Optional: Web Worker for heavier convolution

The core browser pipeline:

1. User uploads or records audio.
2. App decodes audio into an audio buffer.
3. App generates an impulse response buffer.
4. App convolves the input with the impulse response.
5. App renders the output buffer.
6. App plays and visualizes the result.

For a first version, use the Web Audio API `ConvolverNode`.

For more control and clearer teaching, later implement manual convolution in JavaScript or use FFT-based convolution.

---

## 12. Implementation Plan

### MVP Version

The first working version should include:

* upload audio,
* generate impulse response,
* convolve,
* play original and output,
* show waveforms.

Impulse response options for MVP:

1. Identity:
   [
   h[n]=\delta[n]
   ]

2. Single echo:
   [
   h[n]=\delta[n]+\alpha\delta[n-D]
   ]

3. Echo train:
   [
   h[n]=\sum_{m=0}^{M}\alpha^m\delta[n-mD]
   ]

4. Exponential decay:
   [
   h[n]=\alpha^n u[n]
   ]

5. Unit step, truncated:
   [
   h[n]=u[n],\quad 0\le n<L
   ]

For MVP, the most pedagogically important one is the echo train.

---

## 13. Parameters

The app should expose the following controls.

### Echo train

* Delay (D): 100 ms to 1000 ms
* Decay (\alpha): 0.1 to 0.95
* Number of echoes (M): 1 to 20

### Exponential decay

* Decay factor (\alpha): 0.1 to 0.99
* Length (L): 0.1 s to 5 s

### Unit step

* Length (L): 0.1 s to 5 s
* Normalize: on/off

### General

* Output gain
* Normalize output
* Wet/dry mix
* Sample rate display
* Download output

---

## 14. Important Audio Safety Details

Audio convolution can easily produce loud output, especially for impulse responses with large total energy or area.

The app should include:

* automatic peak normalization,
* output gain slider,
* clipping warning,
* mute protection,
* maximum impulse response length,
* maximum output duration.

For teaching, there should be a toggle:

> Preserve mathematical amplitude

versus

> Normalize for safe listening

This is important because normalization may hide the true effect of an unstable or high-gain impulse response.

---

## 15. What the App Should Say About Unit Step

The app should not tell students:

> Unit step impulse response creates repeated clean echoes.

Instead, it should say:

> In our simplified lecture picture, (u[n]) represented equal repeated echoes at abstract echo times. But in actual audio sampling, (u[n]) means the system accumulates all past audio samples. Clean repeated echoes require separated impulses.

Then show:

[
h[n]=\delta[n]+\delta[n-D]+\delta[n-2D]+\cdots
]

This is the correct audio version of repeated equal echoes.

This clarification will make the app mathematically honest and pedagogically stronger.

---

## 16. Example Classroom Demonstration

A possible classroom demo:

1. Record the word “hello.”

2. Play the dry input.

3. Choose identity impulse response:
   [
   h[n]=\delta[n].
   ]
   Output sounds unchanged.

4. Choose one echo:
   [
   h[n]=\delta[n]+0.6\delta[n-D].
   ]
   Output sounds like “hello ... hello.”

5. Choose repeated echo train:
   [
   h[n]=\sum_{m=0}^{8}0.65^m\delta[n-mD].
   ]
   Output sounds like fading echoes.

6. Choose exponential memory:
   [
   h[n]=0.95^n u[n].
   ]
   Output sounds smeared and reverberant.

7. Choose unit step:
   [
   h[n]=u[n].
   ]
   Output becomes accumulated and potentially distorted.

Then conclude:

> The impulse response is the personality of the system. Convolution tells us how that personality acts on any input.

---

## 17. Recommended MVP Name

Possible names:

* EchoConv
* HearConvolution
* ConvoSound
* Impulse Lab
* LTI Audio Playground
* Convolution EarLab

The best classroom-friendly name is:

> LTI Audio Playground

It sounds friendly and directly connects to the course.

---

## 18. Final Summary

The app is feasible and valuable.

The key idea is:

[
\text{input audio} * \text{impulse response} = \text{output audio}
]

The app should let students see and hear this.

The most important design principle is to separate two ideas:

1. mathematical convolution examples;
2. physically meaningful audio effects.

The strongest first demonstration should be an echo train impulse response:

[
h[n]=\sum_{m=0}^{M}\alpha^m\delta[n-mD].
]

That will produce exactly the intuitive fading “hello, hello, hello” effect.

Then, after students understand that, the app can show more abstract impulse responses such as (u[n]) and (\alpha^n u[n]), connecting audio intuition back to the formal theory of LTI systems, stability, and causality.
