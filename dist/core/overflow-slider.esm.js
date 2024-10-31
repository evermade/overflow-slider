import Slider from './slider.esm.js';

function OverflowSlider(container, options, plugins) {
    try {
        // check that container HTML element
        if (!(container instanceof Element)) {
            throw new Error(`Container must be HTML element, found ${typeof container}`);
        }
        const defaults = {
            scrollBehavior: "smooth",
            scrollStrategy: "fullSlide",
            slidesSelector: ":scope > *",
            emulateScrollSnap: false,
            emulateScrollSnapMaxThreshold: 64,
            rtl: false,
        };
        const sliderOptions = Object.assign(Object.assign({}, defaults), options);
        // disable smooth scrolling if user prefers reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            sliderOptions.scrollBehavior = "auto";
        }
        return Slider(container, sliderOptions, plugins);
    }
    catch (e) {
        console.error(e);
    }
}

export { OverflowSlider as default };
