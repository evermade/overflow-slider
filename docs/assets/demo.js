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
import FullWidthPlugin from '../dist/plugins/full-width/full-width/index.esm.js';
import ThumbnailsPlugin from '../dist/plugins/thumbnails/thumbnails/index.esm.js';
import FadePlugin from '../dist/plugins/fade/fade/index.esm.js';

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

		const example1DragScrollingScrollSnap = new OverflowSlider(
			document.querySelector( '.example-container-1-drag-scrolling-scroll-snap' ),
			{
				emulateScrollSnap: true,
			},
			[
				DragScrollingPlugin(),
			]
		);
		console.log( '1-drag-scrolling-scroll-snap', example1DragScrollingScrollSnap );

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
			{
				emulateScrollSnap: true,
			},
			[
				DragScrollingPlugin(),
				SkipLinksPlugin(),
				DotsPlugin(),
			]
		);
		console.log( '1-dots', example1Dots );

		const example1Fade = new OverflowSlider(
			document.querySelector( '.example-container-1-fade' ),
			{
				emulateScrollSnap: true,
			},
			[
				DragScrollingPlugin(),
				FadePlugin({
					containerEnd: document.querySelector( '.example-container-1-fade__end' ),
				}),
			]
		);
		console.log( '1-fade', example1Fade );

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
			{
				emulateScrollSnap: true,
			},
			[
				DragScrollingPlugin(),
				ScrollIndicatorPlugin(),
			]
		);
		console.log( '3-scroll-snapping-mandatory', example3ScrollSnappingMandatory );

		const example3ScrollSnappingProximity = new OverflowSlider(
			document.querySelector( '.example-container-3-scroll-snapping-proximity' ),
			{
				emulateScrollSnap: true,
			},
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

		const example4Filters = new OverflowSlider(
			document.querySelector( '.example-container-4-filters' ),
			{},
			[
				DragScrollingPlugin(),
				ArrowsPlugin({
					containerPrev: document.querySelector( '.example-4-filters-previous' ),
					containerNext: document.querySelector( '.example-4-filters-next' ),
				})
			]
		);
		console.log( '4-filters', example4Filters );

		const example4GridOrSliders = new OverflowSlider(
			document.querySelector( '.example-container-4-grid-or-slider' ),
			{
				emulateScrollSnap: true,
			},
			[
				DragScrollingPlugin(),
				ScrollIndicatorPlugin(),
			]
		);
		console.log( '4-grid-or-slider', example4GridOrSliders );

		const example4FullWidth = new OverflowSlider(
			document.querySelector( '.example-container-4-full-width' ),
			{},
			[
				DragScrollingPlugin(),
				FullWidthPlugin(
					{
						targetWidth: (slider) => {
							// copy the width of the parent element
							return slider.container.parentElement.clientWidth;
						}
					}
				),
				ScrollIndicatorPlugin(),
			]
		);
		console.log( '4-full-width', example4FullWidth );

		const example4SyncedMain = new OverflowSlider(
			document.querySelector( '.example-container-4-synced-main' ),
			{
				emulateScrollSnap: true,
			},
			[
				DragScrollingPlugin(),
			]
		);
		console.log( '4-synced-main', example4SyncedMain );

		const example4SyncedThumbnails = new OverflowSlider(
			document.querySelector( '.example-container-4-synced-thumbnails' ),
			{
				emulateScrollSnap: true,
			},
			[
				DragScrollingPlugin(),
				ThumbnailsPlugin({
					mainSlider: example4SyncedMain,
				}),
			]
		);
		console.log( '4-synced-thumbnails', example4SyncedThumbnails );



	};

	init();
})();
