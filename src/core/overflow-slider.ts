import Slider from './slider';

import {
	SliderOptionArgs,
  SliderOptions,
  SliderPlugin,
} from './types';

export default function OverflowSlider (
	container: HTMLElement,
	options?: SliderOptionArgs,
	plugins?: SliderPlugin[]
) {
	try {

		// check that container HTML element
		if (!(container instanceof Element)) {
			throw new Error(`Container must be HTML element, found ${typeof container}`);
		}

		const defaults: SliderOptionArgs = {
			cssVariableContainer: container,
			scrollBehavior: "smooth",
			scrollStrategy: "fullSlide",
			slidesSelector: ":scope > *",
			emulateScrollSnap: false,
			emulateScrollSnapMaxThreshold: 64,
			rtl: false,
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
