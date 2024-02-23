import Slider from './slider';

import {
  SliderOptions,
  SliderPlugin,
} from './types';

export default function OverflowSlider (
	container: HTMLElement,
	options?: SliderOptions,
	plugins?: SliderPlugin[]
) {
	try {

		// check that container HTML element
		if (!(container instanceof Element)) {
			throw new Error(`Container must be HTML element, found ${typeof container}`);
		}

		const defaults = {
			scrollBehavior: "smooth",
			scrollStrategy: "fullSlide",
			slidesSelector: ":scope > *",
		};

		const sliderOptions = { ...defaults, ...options };

		// disable smooth scrolling if user prefers reduced motion
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			sliderOptions.scrollBehavior = "auto";
		}

		return Slider(
			container,
			sliderOptions,
			plugins,
		);
	} catch (e) {
		console.error(e)
	}
}
