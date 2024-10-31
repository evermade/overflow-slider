const DEFAULT_TARGET_WIDTH = (slider) => { var _a, _b; return (_b = (_a = slider.container.parentElement) === null || _a === void 0 ? void 0 : _a.offsetWidth) !== null && _b !== void 0 ? _b : window.innerWidth; };
function FullWidthPlugin(args) {
    return (slider) => {
        var _a, _b, _c;
        const options = {
            targetWidth: (_a = args === null || args === void 0 ? void 0 : args.targetWidth) !== null && _a !== void 0 ? _a : DEFAULT_TARGET_WIDTH,
            addMarginBefore: (_b = args === null || args === void 0 ? void 0 : args.addMarginBefore) !== null && _b !== void 0 ? _b : true,
            addMarginAfter: (_c = args === null || args === void 0 ? void 0 : args.addMarginAfter) !== null && _c !== void 0 ? _c : true,
        };
        const update = () => {
            const slides = slider.container.querySelectorAll(slider.options.slidesSelector);
            if (!slides.length) {
                return;
            }
            const firstSlide = slides[0];
            const lastSlide = slides[slides.length - 1];
            const marginAmount = Math.floor((window.innerWidth - options.targetWidth(slider)) / 2);
            if (options.addMarginBefore) {
                firstSlide.style.marginInlineStart = `${marginAmount}px`;
            }
            if (options.addMarginAfter) {
                lastSlide.style.marginInlineEnd = `${marginAmount}px`;
            }
            slider.container.setAttribute('data-full-width-offset', marginAmount.toString());
            setCSS();
        };
        const setCSS = () => {
            slider.container.style.setProperty('--slider-container-target-width', `${options.targetWidth(slider)}px`);
        };
        update();
        slider.on('contentsChanged', update);
        slider.on('containerSizeChanged', update);
        window.addEventListener('resize', setCSS);
    };
}

export { FullWidthPlugin as default };
