/**
 * Hello!
 *
 * This is not how you import files in real project. This is only done this way
 * to make it work with the demo page that cannot import the package from npm.
 *
 * In a real project, you would do something like this:
 *
 * import { OverflowSlider } from '@overflow-slider/core';
 * import DragScrollingPlugin from '@overflow-slider/plugins/drag-scrolling';
 * import SkipLinksPlugin from '@overflow-slider/plugins/skip-links';
 */
import { OverflowSlider } from '../dist/index.esm.js';
import DragScrollingPlugin from '../dist/plugins/drag-scrolling/drag-scrolling/index.esm.js';
import SkipLinksPlugin from '../dist/plugins/skip-links/skip-links/index.esm.js';
import ArrowsPlugin from '../dist/plugins/arrows/arrows/index.esm.js';
import ScrollIndicatorPlugin from '../dist/plugins/scroll-indicator/scroll-indicator/index.esm.js';
import DotsPlugin from '../dist/plugins/dots/dots/index.esm.js';

(function () {
	const init = () => {

		const example1CSS = new OverflowSlider(
			document.querySelector( '.example-container-1-css' ),
		);
		console.log( '1-css', example1CSS );

		const example1DragScrolling = new OverflowSlider(
			document.querySelector( '.example-container-1-drag-scrolling-clickable' ),
			{},
			[
				DragScrollingPlugin(),
				SkipLinksPlugin(),
			]
		);
		console.log( '1-drag-scrolling-clickable', example1DragScrolling );

		const example1DragScrollingNotClickable = new OverflowSlider(
			document.querySelector( '.example-container-1-drag-scrolling-not-clickable' ),
			{},
			[
				DragScrollingPlugin(),
				SkipLinksPlugin(),
			]
		);
		console.log( '1-drag-scrolling-not-clickable', example1DragScrollingNotClickable );

		const example1Arrows = new OverflowSlider(
			document.querySelector( '.example-container-1-arrows' ),
			{},
			[
				DragScrollingPlugin(),
				SkipLinksPlugin(),
				ArrowsPlugin(),
			]
		);
		console.log( '1-arrows', example1Arrows );

		const example1ScrollIndicator = new OverflowSlider(
			document.querySelector( '.example-container-1-scroll-indicator' ),
			{},
			[
				DragScrollingPlugin(),
				SkipLinksPlugin(),
				ScrollIndicatorPlugin(),
			]
		);
		console.log( '1-scroll-indicator', example1ScrollIndicator );

		const example1Dots = new OverflowSlider(
			document.querySelector( '.example-container-1-dots' ),
			{},
			[
				DragScrollingPlugin(),
				SkipLinksPlugin(),
				DotsPlugin(),
			]
		);
		console.log( '1-dots', example1Dots );

		const example2PerfectFit = new OverflowSlider(
			document.querySelector( '.example-container-2-perfect-fit' ),
			{},
			[
				DragScrollingPlugin(),
				ScrollIndicatorPlugin(),
			]
		);
		console.log( '2-perfect-fit', example2PerfectFit );

		const example2VaryingWidths = new OverflowSlider(
			document.querySelector( '.example-container-2-varying-widths' ),
			{},
			[
				DragScrollingPlugin(),
				ScrollIndicatorPlugin(),
			]
		);
		console.log( '2-varying-widths', example2VaryingWidths );

		const example2OnlyFewSlides = new OverflowSlider(
			document.querySelector( '.example-container-2-only-few-slides' ),
			{},
			[
				DragScrollingPlugin(),
				ScrollIndicatorPlugin(),
			]
		);
		console.log( '2-only-few-slides', example2OnlyFewSlides );

		const example3ScrollSnappingMandatory = new OverflowSlider(
			document.querySelector( '.example-container-3-scroll-snapping-mandatory' ),
			{},
			[
				DragScrollingPlugin(),
				ScrollIndicatorPlugin(),
			]
		);
		console.log( '3-scroll-snapping-mandatory', example3ScrollSnappingMandatory );

		const example3ScrollSnappingProximity = new OverflowSlider(
			document.querySelector( '.example-container-3-scroll-snapping-proximity' ),
			{},
			[
				DragScrollingPlugin(),
				ScrollIndicatorPlugin(),
			]
		);
		console.log( '3-scroll-snapping-proximity', example3ScrollSnappingProximity );

		const example3EntranceAnimation = new OverflowSlider(
			document.querySelector( '.example-container-3-entrance-animation' ),
			{},
			[
				DragScrollingPlugin(),
				ScrollIndicatorPlugin(),
			]
		);
		console.log( '3-entrance-animation', example3EntranceAnimation );
	};

	init();
})();
