# Overflow Slider

This is slider library that is based on CSS overflow and progressive enhancements via JavaScript. The library is written in TypeScript but it requires no dependencies.

This library is heavily inspired by [Keen Slider](https://keen-slider.io/) and provides somewhat similar programming interface but with different engine running under the hood – CSS overflow.

Overflow Slider aims to be lightweight, mobile-first and accessible. It is designed to be used in modern web projects and is very customizable and extendable via plugins and CSS.

## Demos

* [Example and demos](https://evermade.github.io/overflow-slider/)
* [RTL demos](https://evermade.github.io/overflow-slider/index-rtl.html)

## Getting started

Markup:

```html
<div class="overflow-slider">
	<div>Slide 1</div>
	<div>Slide 2</div>
	<div>Slide 3</div>
</div>
```

You don't have to use even class `overflow-slider` and slides can be whatever elements like `<a>`, `<li>`, or `article`.

If you’re using a bundler (such as Webpack or Rollup), you can install through npm:

```bash
npm install @evermade/overflow-slider
```

Import the `OverflowSlider` along with plugins you want to use.

```ts
import { OverflowSlider } from '@evermade/overflow-slider';
import DragScrollingPlugin from '@evermade/overflow-slider/plugins/drag-scrolling';
import SkipLinksPlugin from '@evermade/overflow-slider/plugins/skip-links';
import ArrowsPlugin from '@evermade/overflow-slider/plugins/arrows';
import ScrollIndicatorPlugin from '@evermade/overflow-slider/plugins/scroll-indicator';
import DotsPlugin from '@evermade/overflow-slider/plugins/dots';

// minimal example
const minimalSlider = new OverflowSlider(
	document.querySelector( '.slider-container-here' ),
);

// example with plugins
const slider = new OverflowSlider(
	document.querySelector( '.slider-container-here' ),
	{
		// options here
	},
	[
		DragScrollingPlugin(),
		ArrowsPlugin(),
		ScrollIndicatorPlugin(),
		DotsPlugin(),
		SkipLinksPlugin(),
	]
);

// note that many plugins have their own settings so you can pass them as an object

const slider = new OverflowSlider(
	document.querySelector( '.slider-container-here' ),
	{
		emulateScrollSnap: true,
	},
	[
		ArrowsPlugin({
			texts: {
				buttonPrevious: 'Previous',
				buttonNext: 'Next',
			},
			icons: {
				prev: '<svg>...</svg>',
				next: '<svg>...</svg>',
			},
			classNames: {
				navContainer: 'my-nav-container',
				prevButton: 'my-prev-button',
				nextButton: 'my-next-button',
			},
			container: document.querySelector( '.my-nav-container' ),
		}),
	]
);

```

### Styles

You can import base styles from the library to get started. The base styles include basic styles for the slider and some plugins.

```scss
@import "@evermade/overflow-slider/style.css";
```

You can use the CSS variables to override some values easily.

Note that you can easily write styles from scratch if you want to. See source code from `src/overflow-slider.scss` for reference.

## Slides per view

You control slides per view in CSS. Set gap between slides via `gap` to slider. Slide layout/size is controlled by `width` property. You can use others but `width` is the most stable.

### A) Fixed width

Set fixed width for slides: `width: 200px;`. Note you can freely change this with media queries.

### B) Relative width

Set relative width for slides: `width: 100vw;`. Note that you cannot use percentages because they are relative to the container and not the viewport.

### C) Variable based width

This is most practical approach if you want to make sure exactly 3 slides are visible at all times or so. Or you want to display like 1.5 slides in mobile per view.

This is based on getting the container width and dividing it by the number of slides you want to show and subtracting the gap. It's recommended to add SCSS mixin for this in case you are using SCSS.

Mixin:

```scss
@mixin slideWidth($slidesPerView: 3, $gap: var(--slide-gap, 1rem), $containerWidth: var(--slider-container-width, 90vw)) {
	width: calc( ( #{$containerWidth} / #{$slidesPerView} ) - calc( #{$slidesPerView} - 1 ) / #{$slidesPerView} * #{$gap});
}
```

Usage:

```scss
.overflow-slider {
	--gap: 1.5rem;
	gap: var(--gap);
	> * {
		--slides-per-view: 3;
		@include slideWidth(
			var(--slides-per-view),
			var(--gap),
			var(--slider-container-width)
		);
	}
}
```

Note that if you are using FullWidthPlugin, you should use container width from `--slider-container-target-width` instead of `--slider-container-width`.

## Plugins

### DragScrollingPlugin

This plugin allows you to scroll the slider by dragging with a mouse. This works with items that have links or are links themselves.

```ts
import DragScrollingPlugin from '@evermade/overflow-slider/plugins/drag-scrolling';

const slider = new OverflowSlider(
	document.querySelector( '.slider-container-here' ),
	{},
	[
		DragScrollingPlugin(), // add options here or don't
	]
);
```

All options are optional.

```ts
type DragScrollingOptions = {
	draggedDistanceThatPreventsClick: number, // default 10, how much user can drag before it's considered a drag and not a click in case of links
};
```

### ArrowsPlugin

This plugin adds previous and next arrows to the slider. You can customize the text, icons and class names.

```ts
import ArrowsPlugin from '@evermade/overflow-slider/plugins/arrows';

const slider = new OverflowSlider(
	document.querySelector( '.slider-container-here' ),
	{},
	[
		ArrowsPlugin(), // add options here or don't
	]
);
```

All options are optional.

```ts
type ArrowsOptions = {
	texts: {
		buttonPrevious: string;
		buttonNext: string;
	},
	icons: {
		prev: string; // SVG or other HTML
		next: string; // SVG or other HTML
	},
	classNames: {
		navContainer: string;
		prevButton: string;
		nextButton: string;
	},
	container: HTMLElement | null, // container for both arrows
	containerPrev: HTMLElement | null, // container for previous arrow
	containerNext: HTMLElement | null, // container for next arrow
};
```

### ScrollIndicatorPlugin

This plugin adds a scroll indicator to the slider. The indicator is a bar that shows how much of the slider is scrolled. Scroll indicator is like a custom scrollbar that is always visible.

```ts
import ScrollIndicatorPlugin from '@evermade/overflow-slider/plugins/scroll-indicator';

const slider = new OverflowSlider(
	document.querySelector( '.slider-container-here' ),
	{},
	[
		ScrollIndicatorPlugin(), // add options here or don't
	]
);
```

All options are optional.

```ts
type ScrollIndicatorOptions = {
	classNames: {
		scrollIndicator: string;
		scrollIndicatorBar: string;
		scrollIndicatorButton: string;
	},
	container: HTMLElement | null, // container for the scroll indicator
};
```

### DotsPlugin

This plugin adds dots to the slider. Dots are like pagination that shows how many slides there are and which one is active. For usability, scroll indicator is preferable.

```ts
import DotsPlugin from '@evermade/overflow-slider/plugins/dots';

const slider = new OverflowSlider(
	document.querySelector( '.slider-container-here' ),
	{},
	[
		DotsPlugin(), // add options here or don't
	]
);
```

All options are optional.

```ts
type DotsOptions = {
	texts: {
		dotDescription: string;
	},
	classNames: {
		dotsContainer: string;
		dotsItem: string;
	},
	container: HTMLElement | null,
};
```

### SkipLinksPlugin

This plugin adds skip links to the slider for keyboard users. Skip links are links that allow users to skip the whole slider and land after it. This is useful for accessibility.

```ts
import SkipLinksPlugin from '@evermade/overflow-slider/plugins/skip-links';

const slider = new OverflowSlider(
	document.querySelector( '.slider-container-here' ),
	{},
	[
		SkipLinksPlugin(), // add options here or don't
	]
);
```

All options are optional.

```ts
type SkipLinkOptions = {
	texts: {
		skipList: string;
	},
	classNames: {
		skipLink: string;
		skipLinkTarget: string;
	},
	containerBefore: HTMLElement | null,
	containerAfter: HTMLElement | null,
};
```

### FullWidthPlugin

This plugin allows you to make the slider full width but have the start of the sliders aligned to your content width. They are scrollable to the full width but the slides are aligned to the content width for the start and end.

```ts
import FullWidthPlugin from '@evermade/overflow-slider/plugins/full-width';

const slider = new OverflowSlider(
	document.querySelector( '.slider-container-here' ),
	{},
	[
		FullWidthPlugin(), // add options here or don't
	]
);
```

All options are optional.

```ts
type FullWidthOptions = {
	targetWidth: ( slider: Slider ) => number,
	addMarginBefore: boolean,
	addMarginAfter: boolean,
};
```

Example of `targetWidth` function:

```ts
const sliderElement = document.querySelector( '.slider-container-here' );
const sliderWrapper = document.querySelector( '.slider-wrapper' );
if ( !sliderElement || !sliderWrapper ) {
	throw new Error( 'Slider element or wrapper not found' );
}
const slider = new OverflowSlider(
	sliderElement,
	{},
	[
		FullWidthPlugin({
			targetWidth: ( slider ) => {
				return sliderWrapper.offsetWidth;
			},
		}),
	]
);
```

### FadePlugin

This plugin adds a hint that there are more slides to scroll to. It fades the slides at the start and end of the slider to hint that there are more slides to scroll to.

```ts
import FadePlugin from '@evermade/overflow-slider/plugins/fade';

const slider = new OverflowSlider(
	document.querySelector( '.slider-container-here' ),
	{},
	[
		FadePlugin(), // add options here or don't
	]
);
```

All options are optional.

```ts
type FadeOptions = {
	classNames: {
		fadeItem: string;
		fadeItemStart: string;
		fadeItemEnd: string;
	},
	container: HTMLElement | null,
	containerStart: HTMLElement | null,
	containerEnd: HTMLElement | null,
};
```

### ThumbnailsPlugin

This plugin adds synchronized thumbnails to the slider. Thumbnails are like dots but they are images of the slides. They are synchronized with the main slider.

```ts
import ThumbnailsPlugin from '@evermade/overflow-slider/plugins/thumbnails';

const slider = new OverflowSlider(
	document.querySelector( '.slider-container-here' ),
	{},
	[
		ThumbnailsPlugin(), // add options here or don't
	]
);
```

You need to set mainSlider reference.

```ts
type ThumbnailsOptions = {
	mainSlider: Slider,
}
```

Example:

```ts
const mainSlider = new OverflowSlider(
	document.querySelector( '.slider-container-here' ),
);

const thumbnailsSlider = new OverflowSlider(
	document.querySelector( '.thumbnails-container-here' ),
	{},
	[
		ThumbnailsPlugin({
			mainSlider: mainSlider,
		}),
	]
);
```

## Known issues

### CSS grids and Overflow Slider

You can use use Overflow Slider within CSS grid but if you are using `fr` units remember to set them like `minmax(0, 1fr)` instead of just `1fr`. With plain `1fr` the width of columns can be calculated incorrectly by browser.

### CSS scroll-snap can be buggy

If you are using `scroll-snap-type` CSS property, you might encounter some bugs like browser wants to snap to a slide regardless of margins. It's most reliable when there's only one slide per view.

## Limitations

### Vertical scrolling

The library is designed to work with horizontal scrolling. Vertical scrolling is not supported and likely never will because it is not a common use case for sliders.

### Looping slides

Looping slides is not supported and likely never will be. It is a feature that is not very common and it is not very accessible.

### Auto-play

Auto-play is not supported at the moment but can probably be implemented as a plugin. It is not very accessible and should be avoided if possible.

## To-do

* Maybe split styles to separate files for plugins (but keep offering bundle as well)
* Maybe add plugin that adds class for visible slides
* Document all plugins and their parameters here

## Changelog

### 3.2.1

* Add: Documentation on plugins
* Fix: Make types more strict and remove all "any" types

### 3.2.0

* Add: RTL support
* Add: `--slider-container-target-width` for FullWidthPlugin to allow CSS based on target size
* Add: Documentation how to set slides per view in CSS
* Fix: Attach ThumbnailsPlugin to scrollEnd which skips in-between slides when multiple slides are scrolled at once

### 3.1.0

* Add: slider.getInclusiveScrollWidth and slider.getInclusiveScrollHeight methods to get widths including outermost childs outermost margins
* Fix: Lot of bugs related to subpixel widths
* Fix: Don't run arrow click action if there are no more slides to scroll to
* Fix: FullWidthPlugin bugs where arrows were not detecting start or end properly (because of child margins not taken into account)
* Fix: Attach ThumbnailsPlugin to activeSlideChanged which is more appropriate hook

### 3.0.0

* Breaking: Change dot plugin to calculate dots based on slides instead of container width "pages"
* Add: FadePlugin to hint that there are more slides to scroll to
* Add: Scroll snap emulation method
* Add: Scroll snap emulation for DragScrollingPlugin
* Add: Hooks for different types of scrolling (any, native, programmatic)
* Add: Hooks for different states of scrolling (start, scroll, end) for above types
* Refactor: Scroll snapping exceptions to be handled by the core slider
* Fix: Enhance performance by hooking some plugins only when scrolling has ended
* Fix: Full width alignment to take into account the container offset

### 2.0.2

* Fix: Import style.css from correct path

### 2.0.1

* Fix: Smooth scrolling for moveToSlide method
* Fix: Prev arrow sometimes leaving visible although there are no more slides to scroll to

### 2.0.0

* Breaking: Separate plugins to their own imports/files
* Add: FullWidthPlugin to allow full width sliders
* Add: ThumbnailsPlugin to show synchronized thumbnails
* Add: Slider container 'data-ready' attribute when initialized to help writing CSS
* Add: Support for optional separate containers for prev and next arrows
* Add: Slides as array to Slider instance
* Add: Active slide ID to Slider instance as activeSlideIdx and hook activeSlideChanged
* Fix: DragScrollingPlugin dragging clickable slides in Firefox
* Fix: DragScrollingPlugin dragging outside of container bugs in Firefox/Safari
* Fix: ScrollIndicatorPlugin width calculation when scrollbar and container are not same width

### 1.1.0

* Add: Grab cursor when hovering slider that has DragScrollingPlugin
* Add: Example of using entrance and exit animations for slides
* Fix: ScrollIndicatorPlugin dragging works now with touch
* Fix: Hide native scrollbar also in Firefox + Edge
* Docs: Add more info on required markup and limitations

## Development

Install tools `npm install` and build `npm run build` or develop with `npm run watch`.

Releasing new version:

* Update version in `package.json`
* Commit to master
* Set tag with version number to git
* Create new release in GitHub
* NPM package is automatically published from GitHub
