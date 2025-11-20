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
import DragScrollingPlugin from '../dist/plugins/drag-scrolling/index.esm.js';
import SkipLinksPlugin from '../dist/plugins/skip-links/index.esm.js';
import ArrowsPlugin from '../dist/plugins/arrows/index.esm.js';
import AutoplayPlugin from '../dist/plugins/autoplay/index.esm.js';
import ScrollIndicatorPlugin from '../dist/plugins/scroll-indicator/index.esm.js';
import DotsPlugin from '../dist/plugins/dots/index.esm.js';
import FullWidthPlugin from '../dist/plugins/full-width/index.esm.js';
import ThumbnailsPlugin from '../dist/plugins/thumbnails/index.esm.js';
import FadePlugin from '../dist/plugins/fade/index.esm.js';
import ClassNamesPlugin from '../dist/plugins/classnames/index.esm.js';


(function () {
	const init = () => {

		const example1CSS = new OverflowSlider(
			document.querySelector( '.example-container-1-css' ),
		);
		console.log( '1-css', example1CSS );

		const example1DragScrolling = new OverflowSlider(
			document.querySelector( '.example-container-1-drag-scrolling-clickable' ),
			{
				rtl: document.documentElement.dir === 'rtl',
			},
			[
				DragScrollingPlugin(),
				SkipLinksPlugin(),
			]
		);
		console.log( '1-drag-scrolling-clickable', example1DragScrolling );

		const example1DragScrollingNotClickable = new OverflowSlider(
			document.querySelector( '.example-container-1-drag-scrolling-not-clickable' ),
			{
				rtl: document.documentElement.dir === 'rtl',
			},
			[
				DragScrollingPlugin(),
				SkipLinksPlugin(),
			]
		);

		const example1DragScrollingScrollSnap = new OverflowSlider(
			document.querySelector( '.example-container-1-drag-scrolling-scroll-snap' ),
			{
				emulateScrollSnap: true,
				rtl: document.documentElement.dir === 'rtl',
			},
			[
				DragScrollingPlugin(),
			]
		);
		console.log( '1-drag-scrolling-scroll-snap', example1DragScrollingScrollSnap );

		const example1Arrows = new OverflowSlider(
			document.querySelector( '.example-container-1-arrows' ),
			{
				rtl: document.documentElement.dir === 'rtl',
			},
			[
				DragScrollingPlugin(),
				SkipLinksPlugin(),
				ArrowsPlugin(),
			]
		);
		console.log( '1-arrows', example1Arrows );

		const example1ArrowsBySlide = new OverflowSlider(
			document.querySelector( '.example-container-1-arrows-by-slide' ),
			{
				rtl: document.documentElement.dir === 'rtl',
			},
			[
				DragScrollingPlugin(),
				SkipLinksPlugin(),
				ArrowsPlugin({
					movementType: 'slide',
				}),
			]
		);
		console.log( '1-arrows-by-slide', example1ArrowsBySlide );

		const example1ScrollIndicator = new OverflowSlider(
			document.querySelector( '.example-container-1-scroll-indicator' ),
			{
				rtl: document.documentElement.dir === 'rtl',
			},
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
				rtl: document.documentElement.dir === 'rtl',
			},
			[
				DragScrollingPlugin(),
				SkipLinksPlugin(),
				DotsPlugin(),
			]
		);
		console.log( '1-dots', example1Dots );

		const example1DotsView = new OverflowSlider(
			document.querySelector( '.example-container-1-dots-view' ),
			{
				emulateScrollSnap: true,
				rtl: document.documentElement.dir === 'rtl',
			},
			[
				DragScrollingPlugin(),
				SkipLinksPlugin(),
				DotsPlugin(
					{
						type: 'view',
					}
				),
			]
		);
		console.log( '1-dots-view', example1DotsView );

		const example1Fade = new OverflowSlider(
			document.querySelector( '.example-container-1-fade' ),
			{
				emulateScrollSnap: true,
				rtl: document.documentElement.dir === 'rtl',
			},
			[
				DragScrollingPlugin(),
				FadePlugin({
					containerEnd: document.querySelector( '.example-container-1-fade__end' ),
				}),
			]
		);
		console.log( '1-fade', example1Fade );

		const example1ClassNames = new OverflowSlider(
			document.querySelector( '.example-container-1-classname-opacity' ),
			{
				emulateScrollSnap: true,
				rtl: document.documentElement.dir === 'rtl',
			},
			[
				DragScrollingPlugin(),
				ClassNamesPlugin(),
			]
		);
		console.log( '1-classname-opacity', example1ClassNames );

		const example1ClassNamesPartly = new OverflowSlider(
			document.querySelector( '.example-container-1-classname-partly' ),
			{
				emulateScrollSnap: true,
				rtl: document.documentElement.dir === 'rtl',
				targetWidth: (slider) => {
					return slider.container.parentElement.clientWidth;
				}
			},
			[
				DragScrollingPlugin(),
				FullWidthPlugin(),
				ClassNamesPlugin(
					{
						classnames: {
							partlyVisible: 'is-partly-visible',
						},
						freezeStateOnVisible: true,
					}
				),
			]
		);
		console.log( '1-classname-partly', example1ClassNamesPartly );

		const example1AutoplaySlide = new OverflowSlider(
			document.querySelector( '.example-container-1-autoplay-slide' ),
			{
				emulateScrollSnap: true,
				rtl: document.documentElement.dir === 'rtl',
			},
			[
				DragScrollingPlugin(),
				AutoplayPlugin({
					movementType: 'slide',
				})
			]
		);
		console.log( '1-autoplay-slide', example1AutoplaySlide );

		const example1AutoplayView = new OverflowSlider(
			document.querySelector( '.example-container-1-autoplay-view' ),
			{
				emulateScrollSnap: true,
				rtl: document.documentElement.dir === 'rtl',
			},
			[
				DragScrollingPlugin(),
				AutoplayPlugin()
			]
		);
		console.log( '1-autoplay-view', example1AutoplayView );

		const example2PerfectFit = new OverflowSlider(
			document.querySelector( '.example-container-2-perfect-fit' ),
			{
				rtl: document.documentElement.dir === 'rtl',
			},
			[
				DragScrollingPlugin(),
				ScrollIndicatorPlugin(),
			]
		);
		console.log( '2-perfect-fit', example2PerfectFit );

		const example2VaryingWidths = new OverflowSlider(
			document.querySelector( '.example-container-2-varying-widths' ),
			{
				rtl: document.documentElement.dir === 'rtl',
			},
			[
				DragScrollingPlugin(),
				ScrollIndicatorPlugin(),
			]
		);
		console.log( '2-varying-widths', example2VaryingWidths );

		const example2OnlyFewSlides = new OverflowSlider(
			document.querySelector( '.example-container-2-only-few-slides' ),
			{
				rtl: document.documentElement.dir === 'rtl',
			},
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
				rtl: document.documentElement.dir === 'rtl',
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
				rtl: document.documentElement.dir === 'rtl',
			},
			[
				DragScrollingPlugin(),
				ScrollIndicatorPlugin(),
			]
		);
		console.log( '3-scroll-snapping-proximity', example3ScrollSnappingProximity );

		const example3EntranceAnimation = new OverflowSlider(
			document.querySelector( '.example-container-3-entrance-animation' ),
			{
				rtl: document.documentElement.dir === 'rtl',
			},
			[
				DragScrollingPlugin(),
				ScrollIndicatorPlugin(),
			]
		);
		console.log( '3-entrance-animation', example3EntranceAnimation );

		const example4Filters = new OverflowSlider(
			document.querySelector( '.example-container-4-filters' ),
			{
				rtl: document.documentElement.dir === 'rtl',
			},
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
				rtl: document.documentElement.dir === 'rtl',
			},
			[
				DragScrollingPlugin(),
				ScrollIndicatorPlugin(),
			]
		);
		console.log( '4-grid-or-slider', example4GridOrSliders );

		const example4FullWidth = new OverflowSlider(
			document.querySelector( '.example-container-4-full-width' ),
			{
				rtl: document.documentElement.dir === 'rtl',
				emulateScrollSnap: true,
				targetWidth: (slider) => {
					return slider.container.parentElement.clientWidth;
				}
			},
			[
				DragScrollingPlugin(),
				FullWidthPlugin(),
				ScrollIndicatorPlugin(),
			]
		);
		console.log( '4-full-width', example4FullWidth );

		const example4SyncedMain = new OverflowSlider(
			document.querySelector( '.example-container-4-synced-main' ),
			{
				emulateScrollSnap: true,
				rtl: document.documentElement.dir === 'rtl',
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
				rtl: document.documentElement.dir === 'rtl',
			},
			[
				DragScrollingPlugin(),
				ThumbnailsPlugin({
					mainSlider: example4SyncedMain,
				}),
			]
		);
		console.log( '4-synced-thumbnails', example4SyncedThumbnails );

		const example4Hero = new OverflowSlider(
			document.querySelector( '.example-container-4-hero' ),
			{
				emulateScrollSnap: true,
				rtl: document.documentElement.dir === 'rtl',
			},
			[
				DragScrollingPlugin(),
				DotsPlugin({
					container: document.querySelector( '.example-container-4-hero__dots' ),
				}),
				AutoplayPlugin({
					movementType: 'slide',
					container: document.querySelector( '.example-container-4-hero__autoplay' ),
				})
			]
		);
		console.log( '4-hero', example4Hero );

	};

	init();
})();
