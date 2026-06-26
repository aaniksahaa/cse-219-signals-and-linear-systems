# Convolution Demo Web App

## Complete Project Specification

## 1. Project Goal

Build a single-page interactive web application that visually demonstrates continuous-time convolution.

The app should help students understand the convolution integral

[
(f*g)(t)=\int_{-\infty}^{\infty} f(x)g(t-x),dx
]

by animating the core steps:

1. Keep (f(x)) fixed.
2. Reflect the second signal (g(x)) to obtain (g(-x)).
3. Shift it by (t) to obtain (g(t-x)).
4. Multiply the overlapping parts: (f(x)g(t-x)).
5. Integrate the product area to obtain one value ((f*g)(t)).
6. Sweep (t) from left to right to build the full convolution output.

The main teaching message is:

> Convolution is not magic. It is the area of overlap after reflecting and sliding one signal across another.

---

## 2. Target User

The target user is a student in a Signals and Systems course who is learning convolution for the first time.

The app should be intuitive enough that a beginner can use it without reading a long manual. The visual animation should explain the idea naturally.

The app should also be mathematically precise enough to support classroom demonstration.

---

## 3. Page Layout

The page is a single webpage titled:

```text
Convolution demo
```

The layout has four main regions.

### Region 1: Function selection controls

At the top, there should be two dropdown menus:

* left dropdown for (f(x)),
* right dropdown for (g(x)).

Example options:

```text
Triangle
Square
Gaussian
Sawtooth
```

The left selected function is shown in red.
The right selected function is shown in blue.

---

### Region 2: Individual function previews

Below the dropdowns, show two small plots side by side:

* left plot: (f(x)),
* right plot: (g(x)).

Each plot should show:

* axes,
* grid,
* function curve,
* function label,
* formula above the plot,
* draggable parameter handles if implemented.

Example:

[
f(x)=
\begin{cases}
a_y-\frac{a_y}{a_x}|x|, & |x|\le a_x,\
0, & \text{otherwise}.
\end{cases}
]

and

[
g(x)=
\begin{cases}
b_y, & |x|\le b_x,\
0, & \text{otherwise}.
\end{cases}
]

---

### Region 3: Main convolution animation plot

This is the central plot.

It should show:

* red: (f(x)),
* blue: (g(t-x)),
* purple: product (f(x)g(t-x)),
* black: accumulated convolution output ((f*g)(t)).

The horizontal axis in the main plot is the variable (x).
The slider controls (t).

For each current value of (t), the app should draw (g(t-x)) as the reflected and shifted version of (g(x)).

The purple shaded region should represent the pointwise product

[
f(x)g(t-x).
]

The black curve should show the convolution output:

[
(f*g)(t)=\int_{-\infty}^{\infty}f(x)g(t-x),dx.
]

At each animation frame, the black curve should show the value of the convolution at the current (t).

---

### Region 4: Controls and formula legend

Below or near the main plot, show:

* Animate button,
* Stop button while animation is running,
* Reset button,
* a slider for (t),
* current value of (t),
* formula legend.

Example legend:

```text
red:      f(x)
blue:     g(t - x)
black:    (f * g)(t) = ∫ f(x)g(t - x) dx
purple:   f(x)g(t - x)
```

The current value should appear near the slider:

```text
t = -3.50
```

---

## 4. Mathematical Behavior

The core quantity is:

[
(f*g)(t)=\int_{-\infty}^{\infty} f(x)g(t-x),dx.
]

For the animation, (f(x)) stays fixed.

The second function is transformed as:

[
g(x)
\quad\longrightarrow\quad
g(-x)
\quad\longrightarrow\quad
g(t-x).
]

The app does not need to explicitly show a separate intermediate (g(-x)) plot, but the main animation should make it clear that the blue function is the reflected-and-shifted copy.

For each value of (t):

[
p_t(x)=f(x)g(t-x)
]

is computed and shown in purple.

Then:

[
c(t)=\int_{-\infty}^{\infty}p_t(x),dx
]

is computed and shown as the black convolution value.

---

## 5. Function Library

The app should support at least the following functions.

---

### 5.1 Triangle

For a triangle centered at zero:

[
f(x)=
\begin{cases}
a_y-\dfrac{a_y}{a_x}|x|, & |x|\le a_x,\
0, & \text{otherwise}.
\end{cases}
]

Parameters:

* (a_x>0): half-width,
* (a_y): peak height.

Default:

```text
a_x = 1
a_y = 1
```

Visual behavior:

* peak at (x=0),
* zero at (x=-a_x) and (x=a_x),
* red if used as (f),
* blue if used as (g).

---

### 5.2 Square

For a square pulse centered at zero:

[
f(x)=
\begin{cases}
a_y, & |x|\le a_x,\
0, & \text{otherwise}.
\end{cases}
]

Parameters:

* (a_x>0): half-width,
* (a_y): height.

Default:

```text
a_x = 0.5
a_y = 1
```

Visual behavior:

* horizontal plateau,
* vertical jumps at (x=-a_x) and (x=a_x).

---

### 5.3 Gaussian

A normalized Gaussian-like function:

[
f(x)=\frac{e^{-x^2/a^2}}{a\sqrt{\pi}}.
]

Parameter:

* (a>0): width.

Default:

```text
a = 0.4
```

This function technically has infinite support. For plotting and numerical integration, it should be truncated to a finite interval such as

[
[-5a,5a]
]

or to the global plotting window.

---

### 5.4 Sawtooth / Ramp Segment

A finite ramp from point ((b_x,b_y)) to point ((b_x',b_y')):

[
g(x)=
\begin{cases}
\dfrac{b_y'-b_y}{b_x'-b_x}(x-b_x)+b_y, & x\in[b_x,b_x'],\
0, & \text{otherwise}.
\end{cases}
]

Parameters:

* (b_x): starting x-coordinate,
* (b_y): starting y-coordinate,
* (b_x'): ending x-coordinate,
* (b_y'): ending y-coordinate.

Default:

```text
b_x = 0
b_y = 0
b_x' = 1
b_y' = 1
```

Visual behavior:

* zero outside the finite interval,
* linear ramp inside the interval,
* draggable handles at (b) and (b'), if implemented.

---

## 6. Main Animation Behavior

The animation should sweep (t) from left to right.

For each (t):

1. Draw (f(x)) in red.
2. Draw (g(t-x)) in blue.
3. Compute the product:

[
p_t(x)=f(x)g(t-x).
]

4. Fill the product area in purple.
5. Compute:

[
c(t)=\int p_t(x),dx.
]

6. Plot (c(t)) as the black convolution curve.

The slider should update the same values manually.

When the user clicks **Animate**, the value of (t) should increase smoothly.

When the user clicks **Stop**, the animation pauses.

When the user clicks **Reset**, (t) returns to the starting value and the animation stops.

---

## 7. Choosing the Animation Range

The animation range for (t) should be large enough to show:

* no overlap on the far left,
* partial overlap,
* maximum overlap,
* decreasing overlap,
* no overlap on the far right.

For finite-support functions, a good default is:

[
t_{\min}=f_{\min}+g_{\min}-m,
]

[
t_{\max}=f_{\max}+g_{\max}+m,
]

where (m) is a small margin.

Here:

* ([f_{\min},f_{\max}]) is the support of (f),
* ([g_{\min},g_{\max}]) is the support of (g).

For infinite-support functions such as Gaussian, use an effective support such as:

[
[-5a,5a].
]

Recommended default plotting range:

```text
xMin = -5
xMax = 5
```

but it should expand if needed.

---

## 8. Numerical Computation

The app can compute the convolution numerically.

Use a uniform grid:

```text
dx = 0.005 or 0.01
```

For each current (t):

```text
sum = 0
for x from xMin to xMax step dx:
    product = f(x) * g(t - x)
    sum += product * dx
```

Then:

```text
convolutionValue = sum
```

This approximates:

[
(f*g)(t)=\int_{-\infty}^{\infty}f(x)g(t-x),dx.
]

For better accuracy, the trapezoidal rule can be used:

```text
sum += 0.5 * (p_i + p_{i+1}) * dx
```

But simple rectangular integration is acceptable for a teaching demo.

---

## 9. Precomputation Strategy

To make animation smooth, precompute convolution values over a grid of (t)-values.

Example:

```text
tSamples = linspace(tMin, tMax, 600)
for each t in tSamples:
    c[t] = numericalConvolution(f, g, t)
```

During animation:

* find the nearest precomputed (t)-sample,
* render the corresponding black curve up to the current (t),
* compute or render the product (f(x)g(t-x)) live.

This makes the black convolution curve smooth and efficient.

---

## 10. Rendering Requirements

The app can use SVG, Canvas, D3, or a custom plotting layer.

SVG is preferred for clarity and easier styling.

Each plot should include:

* x-axis,
* y-axis,
* grid lines,
* tick labels,
* arrowheads on axes,
* function labels,
* colored curves.

Recommended colors:

```text
f(x): red
g(x): blue
g(t-x): blue
product f(x)g(t-x): purple with transparency
convolution output: black
axes: dark gray
grid: light gray
```

The purple product region should be semi-transparent, so the red and blue curves remain visible.

---

## 11. Important Visual Details

### 11.1 Top function plots

The top plots should show the original functions only:

* left: (f(x)),
* right: (g(x)).

These plots help the student see the raw input functions before convolution.

### 11.2 Main plot

The main plot should show the actual convolution process.

The red function is fixed:

[
f(x)
]

The blue function moves:

[
g(t-x).
]

The purple region is:

[
f(x)g(t-x).
]

The black curve is:

[
(f*g)(t).
]

This is the most important teaching region.

### 11.3 Formula panel

The formula panel below the main plot should update depending on the selected functions.

Example:

```text
red:    f(x) = triangle formula
blue:   g(t-x) = transformed formula
black:  (f*g)(t) = ∫ f(x)g(t-x) dx
purple: f(x)g(t-x)
```

The formulas should be rendered using KaTeX or MathJax.

---

## 12. User Interaction

The app should support the following interactions.

### 12.1 Dropdown selection

The user can choose different function types for (f) and (g).

Changing a function should immediately update:

* the top plot,
* formula,
* main plot,
* convolution curve,
* animation range if necessary.

### 12.2 Slider

The slider controls (t).

Moving the slider should update:

* the location of (g(t-x)),
* the purple product region,
* the current black convolution point,
* the displayed (t)-value.

### 12.3 Animation

Buttons:

```text
Animate
Stop
Reset
```

Behavior:

* Animate starts sweeping (t) from current value toward (t_{\max}).
* Stop pauses animation.
* Reset returns (t) to (t_{\min}).

Use `requestAnimationFrame` for smooth animation.

### 12.4 Parameter handles

Optional but useful:

* draggable point (a) for triangle/square/gaussian width and height,
* draggable point (b) for square height/width,
* draggable points (b) and (b') for sawtooth/ramp.

Dragging should update the formula and plots in real time.

If draggable handles are too much for the first implementation, use numeric sliders instead.

---

## 13. Recommended Component Structure

If implemented in React, use this structure:

```text
App
├── Header
├── FunctionControls
│   ├── FunctionSelector for f
│   └── FunctionSelector for g
├── PreviewPlots
│   ├── FunctionPreviewPlot for f
│   └── FunctionPreviewPlot for g
├── AnimationControls
│   ├── AnimateButton
│   ├── ResetButton
│   └── TimeSlider
├── ConvolutionPlot
├── FormulaLegend
└── Footer
```

Suggested TypeScript types:

```ts
type FunctionKind =
  | "triangle"
  | "square"
  | "gaussian"
  | "sawtooth";

type SignalFunction = {
  kind: FunctionKind;
  params: Record<string, number>;
  evaluate: (x: number) => number;
  support: () => [number, number];
  formula: () => string;
};

type ConvolutionState = {
  f: SignalFunction;
  g: SignalFunction;
  t: number;
  tMin: number;
  tMax: number;
  isAnimating: boolean;
  convolutionSamples: Array<{ t: number; value: number }>;
};
```

---

## 14. Core Functions

### 14.1 Evaluate transformed signal

```ts
function evaluateShiftedReflectedG(g: SignalFunction, x: number, t: number): number {
  return g.evaluate(t - x);
}
```

This implements:

[
g(t-x).
]

---

### 14.2 Evaluate product

```ts
function evaluateProduct(
  f: SignalFunction,
  g: SignalFunction,
  x: number,
  t: number
): number {
  return f.evaluate(x) * g.evaluate(t - x);
}
```

This implements:

[
f(x)g(t-x).
]

---

### 14.3 Numerical convolution

```ts
function numericalConvolution(
  f: SignalFunction,
  g: SignalFunction,
  t: number,
  xMin: number,
  xMax: number,
  dx: number
): number {
  let sum = 0;

  for (let x = xMin; x <= xMax; x += dx) {
    sum += f.evaluate(x) * g.evaluate(t - x) * dx;
  }

  return sum;
}
```

---

### 14.4 Precompute convolution curve

```ts
function precomputeConvolution(
  f: SignalFunction,
  g: SignalFunction,
  tMin: number,
  tMax: number,
  numSamples: number,
  xMin: number,
  xMax: number,
  dx: number
) {
  const result = [];

  for (let i = 0; i < numSamples; i++) {
    const t = tMin + (i / (numSamples - 1)) * (tMax - tMin);
    const value = numericalConvolution(f, g, t, xMin, xMax, dx);
    result.push({ t, value });
  }

  return result;
}
```

---

## 15. Formula Rendering

Use KaTeX or MathJax to render formulas.

Each function should provide its formula as a string.

Example triangle formula:

```latex
f(x)=
\begin{cases}
a_y-\frac{a_y}{a_x}|x|, & |x|\le a_x,\\
0, & \text{otherwise}.
\end{cases}
```

For the transformed second signal:

[
g(t-x)
]

show the formula after substituting (x\mapsto t-x).

Example if (g) is square:

[
g(t-x)=
\begin{cases}
b_y, & |t-x|\le b_x,\
0, & \text{otherwise}.
\end{cases}
]

---

## 16. Example Scenarios to Support

The screenshots show several useful demonstration cases. The app should support all of them.

---

### 16.1 Triangle convolved with square

Selections:

```text
f = Triangle
g = Square
```

Expected visual behavior:

* Blue square slides across red triangle.
* Purple region appears only where the two overlap.
* Black convolution curve rises, peaks, then falls.
* The product region is the part of the triangle covered by the square.

This is probably the best beginner demo.

---

### 16.2 Square convolved with sawtooth

Selections:

```text
f = Square
g = Sawtooth
```

Expected visual behavior:

* A reflected ramp slides across a rectangle.
* The product region is a clipped ramp.
* The convolution output becomes a smooth piecewise curve.

This is useful for showing that simple shapes can produce nontrivial outputs.

---

### 16.3 Gaussian convolved with sawtooth

Selections:

```text
f = Gaussian
g = Sawtooth
```

Expected visual behavior:

* The Gaussian smoothly weights the ramp.
* The purple overlap is smooth.
* The black output curve is also smooth.

This is useful for showing convolution as a smoothing or blending operation.

---

## 17. Teaching Annotations

The app should include small textual labels, but avoid clutter.

Good labels:

```text
red: f(x)
blue: g(t-x)
purple: f(x)g(t-x)
black: (f*g)(t)
```

Good short explanation:

```text
Move the slider. At each t, the purple area is integrated to produce one black output value.
```

Avoid too much paragraph text inside the plot.

The plot should teach visually.

---

## 18. Edge Cases

### 18.1 No overlap

When there is no overlap:

[
f(x)g(t-x)=0
]

for all (x). Therefore:

[
(f*g)(t)=0.
]

The app should show:

* no purple region,
* black convolution value at zero.

---

### 18.2 Full or maximum overlap

When overlap is large, the purple region should clearly show the product area.

For triangle-square convolution, this happens when the square covers the peak of the triangle.

---

### 18.3 Infinite-support functions

For Gaussian, use effective support.

Example:

```text
effective support = [-5a, 5a]
```

This keeps computation finite while visually accurate.

---

### 18.4 Negative values

The app should eventually support negative function values.

If the product is negative, the purple product region may go below the x-axis.

The convolution value can also become negative.

For the first version, all included functions can remain nonnegative.

---

## 19. Styling Requirements

The style should be simple, clean, and classroom-friendly.

Recommended visual style:

* white background,
* light gray grid,
* red for (f),
* blue for (g),
* purple transparent fill for product,
* black curve for convolution,
* large readable labels,
* minimal clutter.

Buttons:

```text
Animate: blue
Stop: red
Reset: orange
```

The overall page should resemble a simple academic demo rather than a heavy dashboard.

---

## 20. Responsive Behavior

The app should work well on desktop screens.

Minimum target width:

```text
1000 px
```

For smaller screens:

* stack top plots vertically,
* keep the main convolution plot full width,
* make the slider responsive.

Since this is likely for classroom projection, desktop layout is the priority.

---

## 21. Performance Requirements

The app should feel smooth.

Recommended settings:

```text
xSamples: 800 to 1500
tSamples: 400 to 800
animation FPS: 30 to 60
```

If performance is slow:

* reduce sampling resolution,
* precompute convolution values,
* use Canvas for the main plot,
* use Web Worker for convolution precomputation.

---

## 22. Implementation Roadmap

### Phase 1: Static plotting

Implement:

* function definitions,
* top preview plots,
* main plot with fixed (t),
* formula legend.

No animation yet.

---

### Phase 2: Slider-based convolution

Implement:

* (t)-slider,
* draw (g(t-x)),
* draw purple product region,
* compute one convolution value.

---

### Phase 3: Full convolution curve

Implement:

* precomputation over (t),
* black convolution curve,
* current (t) marker.

---

### Phase 4: Animation

Implement:

* Animate button,
* Stop button,
* Reset button,
* smooth update using `requestAnimationFrame`.

---

### Phase 5: Interactivity and polish

Implement:

* draggable parameter points,
* responsive layout,
* better formulas,
* source link,
* polished teaching labels.

---

## 23. Acceptance Criteria

The project is complete when the following are true:

1. The user can select (f) and (g) from dropdowns.
2. The app shows (f(x)) and (g(x)) in separate preview plots.
3. The main plot shows (f(x)) fixed in red.
4. The main plot shows (g(t-x)) sliding in blue.
5. The product (f(x)g(t-x)) is shaded in purple.
6. The convolution output ((f*g)(t)) is drawn in black.
7. The slider manually controls (t).
8. The Animate button sweeps (t) smoothly.
9. Reset returns the system to the initial state.
10. The formulas are displayed clearly.
11. Triangle-square, square-sawtooth, and Gaussian-sawtooth examples all work.
12. The app clearly teaches reflect, shift, multiply, and integrate.

---

## 24. Suggested Final User Experience

A student opens the page.

They choose:

```text
f = Triangle
g = Square
```

They click **Animate**.

They see the blue square slide from left to right across the red triangle.

At first there is no overlap, so the black output is zero.

Then the square begins touching the triangle. A purple region appears.

As the overlap grows, the black convolution curve rises.

When the overlap is largest, the black curve reaches its peak.

Then the overlap shrinks, and the black curve falls back to zero.

The student understands:

> The convolution value at each (t) is just the accumulated overlap area at that moment.

That is the central learning objective.
