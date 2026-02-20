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
@use "@evermade/overflow-slider/style.css";
```

You can use the CSS variables to override some values easily.

Note that you can easily write styles from scratch if you want to. See source code from `src/overflow-slider.scss` for reference.

## Using in React

Overflow Slider can be used with React. There is no separate core or plugins for React so usage is very similar to vanilla JS. Overflow Slider depends on expanding existing DOM and adding DOM elements so it needs reliable access to these elements.

In React the way to give this access is `useRef`.

```js
import { useRef, useEffect } from 'react';
import { OverflowSlider } from '@evermade/overflow-slider';
import DragScrollingPlugin from '@evermade/overflow-slider/plugins/drag-scrolling';
import ArrowsPlugin from '@evermade/overflow-slider/plugins/arrows';

const ImageSlider = () => {
	const sliderElement = useRef(null);
	const sliderControls = useRef(null);

	useEffect(() => {
		if (!sliderElement.current || !sliderControls.current) {
			return; 
		}

		const slider = new OverflowSlider(
			sliderElement.current,
			{
				emulateScrollSnap: true,
			},
			[
				DragScrollingPlugin(),
				ArrowsPlugin({
					container: sliderControls.current
				}),
			]
		);
	}, []);

	return (
		<div className="slider-container">
			<div className="overflow-slider" ref={sliderElement}>
				<div className="overflow-slider__slider-item"><h2>Slide 1</h2></div>
				<div className="overflow-slider__slider-item"><h2>Slide 2</h2></div>
				<div className="overflow-slider__slider-item"><h2>Slide 3</h2></div>
			</div>
			<div className="slider-controls" ref={sliderControls}>
			</div>
		</div>
	);
};

export default ImageSlider;
```

Note that Overflow Slider does not have destroy() function. If not having it turns out to be a big issue for React we could add it but that is something affecting all core/plugins and can increase bundle size ~25% as it can be a lot of code.

## Mixins

If you are using SCSS, you can use these helpers.

```scss
@use "@evermade/overflow-slider/mixins";
```

### slide-width

```scss
@mixin os-slide-width($slidesPerView: 3, $gap: var(--slide-gap, 1rem), $containerWidth: var(--slider-container-width, 90vw)) {
	width: calc( ( #{$containerWidth} / #{$slidesPerView} ) - calc( #{$slidesPerView} - 1 ) / #{$slidesPerView} * #{$gap});
}
```

Set slide width based on slides per view (more below)

### os-break-out-full-width

Make slider container full width via breaking out of the container that has max-width set.

```scss
@mixin os-break-out-full-width {
	position: relative;
	left: 50%;
	width: 100vw;
	margin-left: -50vw;
}
```

## Slides per view

You control slides per view in CSS. Set gap between slides via `gap` to slider element. Note that you cannot use percentages (like 33.33%) for width because they are relative to the container and not the viewport.

### A) Slides per view approach

This is most practical approach and relies on some calculations. Setting target width for slider container is recommended as that makes the calculations more stable as otherwise container width can depend on slides and if slides then depend on container width that can lead some issues.

Setting target width can be done for example referencing another HTML element in page and copying its width:

```js
const blockWrapper = document.querySelector( '.block-wrapper' );
OverflowSlider(
	sliderContainer,
	{
		targetWidth: () => {
				return (blockWrapper).offsetWidth;
		},
	}
);
```

This creates a `--slider-container-target-width` variable that is now stable.

Use mixin `os-slide-width` 

```scss
.overflow-slider {
	--gap: 1.5rem;
	gap: var(--gap);
	> * {
		--slides-per-view: 1.5;
		@include os-slide-width(
			var(--slides-per-view),
			var(--gap),
			var(--slider-container-target-width)
		);
		@meadia (min-width: 768px) {
			--slides-per-view: 3;
		}
	}
}
```

### B) Fixed width

Set fixed width for slides: `width: 200px;`. Note you can freely change this with media queries.

### C) Relative width

Set relative width for slides: `width: 100vw;`. Note that you cannot use percentages because they are relative to the container and not the viewport.

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
	movementType: 'view' | 'slide', // default 'view', how much to move when arrow is clicked
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
	type: 'view' | 'slide';
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

### ClassNamesPlugin

Adds CSS classes to each slide based on its visibility inside the slider's target width (or the container width when no target width is supplied). Useful for animating only the slides that are currently in view.

```ts
import ClassNamesPlugin from '@evermade/overflow-slider/plugins/classnames';

const slider = new OverflowSlider(
	document.querySelector( '.slider-container-here' ),
	{},
	[
		ClassNamesPlugin({
			freezeStateOnVisible: true,
			classNames: {
				visible: 'is-visible',
				partlyVisible: 'is-partly-visible',
				hidden: 'is-hidden',
			},
		}),
	]
);
```

All options are optional.

```ts
type ClassnameOptions = {
	classNames: {
		visible: string;
		partlyVisible: string;
		hidden: string;
	};
	freezeStateOnVisible: boolean; // keep slides in "visible" state once they have been fully seen
};
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

### AutoplayPlugin

This plugin allows you to automatically scroll the slider. It can be used to create a hero slider that scrolls automatically.

This includes play/pause button and for users that prefer reduced motion, autoplay plugin will not execute.

```ts
import AutoplayPlugin from '@evermade/overflow-slider/plugins/autoplay';
const slider = new OverflowSlider(
 document.querySelector( '.slider-container-here' ),
 {},
 [
	AutoplayPlugin(), // add options here or don't
 ]
);
```

All options are optional.

```ts
export type AutoplayPluginOptions = {
	delayInMs: number;
	texts: {
		play: string;
		pause: string;
	};
	icons: {
		play: string;
		pause: string;
	};
	classNames: {
		autoplayButton: string;
	};
	container: HTMLElement | null;
	movementType: 'view' | 'slide';
	stopOnHover: boolean;
	loop: boolean;
};
```

## Known issues

### CSS grids and Overflow Slider

You can use use Overflow Slider within CSS grid but if you are using `fr` units remember to set them like `minmax(0, 1fr)` instead of just `1fr`. With plain `1fr` the width of columns can be calculated incorrectly by browser.

### CSS scroll-snap can be buggy

If you are using `scroll-snap-type` CSS property, you might encounter some bugs like browser wants to snap to a slide regardless of margins. It's most reliable when there's only one slide per view.

## Limitations

### Vertical scrolling

The library is designed to work with horizontal scrolling. Vertical scrolling is not supported at the moment. Maybe some day but it's much rarer use case.

### Infinite scroll

Infinite scroll is not supported and likely never will be. It is not accessible and causes really complex problems as with overflow we are bound to more "physics" than transform based sliders and there's no escape of the physics (like visible slides need to represent DOM order).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md)

## Development

Install tools `npm install` and build `npm run build` or develop with `npm run watch`.

Releasing new version:

* Update version in `package.json`
* Commit to master
* Set tag with version number to git
* Create new release in GitHub
* NPM package is automatically published from GitHub
