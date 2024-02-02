import {
	OverflowSlider,
	DragScrollingPlugin,
	SkipLinksPlugin,
	ArrowsPlugin,
	ScrollIndicatorPlugin,
	DotsPlugin
} from '../dist/overflow-slider.esm.js';

(function () {
	const init = () => {

		const example1CSS = new OverflowSlider(
			document.querySelector( '.example-container-1-css' ),
		);
		console.log( '1-css', example1CSS );

		const example1DragScrolling = new OverflowSlider(
			document.querySelector( '.example-container-1-drag-scrolling' ),
			{},
			[
				DragScrollingPlugin(),
				SkipLinksPlugin(),
			]
		);
		console.log( '1-drag-scrolling', example1DragScrolling );

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
	};

	init();
})();
