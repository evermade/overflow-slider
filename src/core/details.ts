import { Slider, SliderDetails } from './types';

export default function details( slider: Slider) {

	let instance: SliderDetails;

	let hasOverflow = false;
	let slideCount = 0;
	let containerWidth = 0;
	let scrollableAreaWidth = 0;
	let amountOfPages = 0;
	let currentPage = 1;

	if (slider.container.scrollWidth > slider.container.clientWidth) {
		hasOverflow = true;
	}

	slideCount = Array.from(slider.container.querySelectorAll(slider.options.slidesSelector)).length;

	containerWidth = slider.container.offsetWidth;

	scrollableAreaWidth = slider.container.scrollWidth;

	amountOfPages = Math.ceil(scrollableAreaWidth / containerWidth);

	if (slider.container.scrollLeft >= 0) {
		currentPage = Math.floor(slider.container.scrollLeft / containerWidth);
		// consider as last page if the scrollLeft + containerWidth is equal to scrollWidth
		if (slider.container.scrollLeft + containerWidth === scrollableAreaWidth) {
			currentPage = amountOfPages - 1;
		}
	}

	instance = {
		hasOverflow,
		slideCount,
		containerWidth,
		scrollableAreaWidth,
		amountOfPages,
		currentPage,
	};
	return instance;
};
