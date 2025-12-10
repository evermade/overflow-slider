import { Slider, SliderDetails } from './types';

export default function details( slider: Slider) {

	let instance: SliderDetails;

	let hasOverflow = false;
	let slideCount = 0;
	let containerWidth = 0;
	let containerHeight = 0;
	let scrollableAreaWidth = 0;
	let amountOfPages = 0;
	let currentPage = 0;

	if ( Math.floor( slider.getInclusiveScrollWidth() ) > Math.floor( slider.getInclusiveClientWidth() ) ) {
		hasOverflow = true;
	}

	slideCount = slider.slides.length ?? 0;

	containerWidth = slider.container.offsetWidth;

	containerHeight = slider.container.offsetHeight;

	scrollableAreaWidth = slider.getInclusiveScrollWidth();

	amountOfPages = Math.ceil(scrollableAreaWidth / containerWidth);

	if ( Math.floor( slider.getScrollLeft() ) >= 0) {
		currentPage = Math.floor(slider.getScrollLeft() / containerWidth);

		// Consider as last page if we're within tolerance of the maximum scroll position
		// When FullWidthPlugin is active, account for the margin offset
		const maxScroll = scrollableAreaWidth - containerWidth - (2 * slider.getLeftOffset() );
		if ( slider.getScrollLeft() >= maxScroll - 1 ) {
			currentPage = amountOfPages - 1;
		}
	}

	instance = {
		hasOverflow,
		slideCount,
		containerWidth,
		containerHeight,
		scrollableAreaWidth,
		amountOfPages,
		currentPage,
	};
	return instance;
};
