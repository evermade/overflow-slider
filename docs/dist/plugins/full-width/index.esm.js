const DEFAULT_TARGET_WIDTH = (slider) => { var _a, _b; return (_b = (_a = slider.container.parentElement) === null || _a === void 0 ? void 0 : _a.offsetWidth) !== null && _b !== void 0 ? _b : window.innerWidth; };
function FullWidthPlugin(args) {
    return (slider) => {
        var _a, _b, _c, _d;
        const options = {
            targetWidth: (_a = args === null || args === void 0 ? void 0 : args.targetWidth) !== null && _a !== void 0 ? _a : undefined,
            addMarginBefore: (_b = args === null || args === void 0 ? void 0 : args.addMarginBefore) !== null && _b !== void 0 ? _b : true,
            addMarginAfter: (_c = args === null || args === void 0 ? void 0 : args.addMarginAfter) !== null && _c !== void 0 ? _c : true,
        };
        if (typeof slider.options.targetWidth !== 'function') {
            slider.options.targetWidth = (_d = options.targetWidth) !== null && _d !== void 0 ? _d : DEFAULT_TARGET_WIDTH;
        }
        const resolveTargetWidth = () => {
            var _a;
            if (typeof slider.options.targetWidth === 'function') {
                return slider.options.targetWidth;
            }
            return (_a = options.targetWidth) !== null && _a !== void 0 ? _a : DEFAULT_TARGET_WIDTH;
        };
        const update = () => {
            const slides = slider.container.querySelectorAll(slider.options.slidesSelector);
            if (!slides.length) {
                return;
            }
            const targetWidthFn = resolveTargetWidth();
            const rawMargin = (window.innerWidth - targetWidthFn(slider)) / 2;
            const marginAmount = Math.max(0, Math.floor(rawMargin));
            const marginValue = marginAmount ? `${marginAmount}px` : '';
            slides.forEach((slide) => {
                const element = slide;
                element.style.marginInlineStart = '';
                element.style.marginInlineEnd = '';
            });
            const firstSlide = slides[0];
            const lastSlide = slides[slides.length - 1];
            if (options.addMarginBefore) {
                firstSlide.style.marginInlineStart = marginValue;
                slider.container.style.setProperty('scroll-padding-inline-start', marginValue || '0px');
            }
            else {
                slider.container.style.removeProperty('scroll-padding-inline-start');
            }
            if (options.addMarginAfter) {
                lastSlide.style.marginInlineEnd = marginValue;
                slider.container.style.setProperty('scroll-padding-inline-end', marginValue || '0px');
            }
            else {
                slider.container.style.removeProperty('scroll-padding-inline-end');
            }
            slider.container.setAttribute('data-full-width-offset', `${marginAmount}`);
            setCSS(targetWidthFn);
            slider.emit('fullWidthPluginUpdate');
        };
        const setCSS = (targetWidthFn) => {
            const width = targetWidthFn(slider);
            slider.options.cssVariableContainer.style.setProperty('--slider-container-target-width', `${width}px`);
        };
        update();
        slider.on('contentsChanged', update);
        slider.on('containerSizeChanged', update);
        window.addEventListener('resize', update);
    };
}

export { FullWidthPlugin as default };
