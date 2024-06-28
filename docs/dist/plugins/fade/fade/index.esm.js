function FadePlugin(args) {
    return (slider) => {
        var _a, _b, _c;
        const options = {
            classNames: {
                fadeItem: 'overflow-slider-fade',
                fadeItemStart: 'overflow-slider-fade--start',
                fadeItemEnd: 'overflow-slider-fade--end',
            },
            container: (_a = args === null || args === void 0 ? void 0 : args.container) !== null && _a !== void 0 ? _a : null,
            containerStart: (_b = args === null || args === void 0 ? void 0 : args.containerStart) !== null && _b !== void 0 ? _b : null,
            containerEnd: (_c = args === null || args === void 0 ? void 0 : args.containerEnd) !== null && _c !== void 0 ? _c : null,
        };
        const fadeItemStart = document.createElement('div');
        fadeItemStart.classList.add(options.classNames.fadeItem, options.classNames.fadeItemStart);
        fadeItemStart.setAttribute('aria-hidden', 'true');
        fadeItemStart.setAttribute('tabindex', '-1');
        const fadeItemEnd = document.createElement('div');
        fadeItemEnd.classList.add(options.classNames.fadeItem, options.classNames.fadeItemEnd);
        fadeItemEnd.setAttribute('aria-hidden', 'true');
        fadeItemEnd.setAttribute('tabindex', '-1');
        if (options.containerStart) {
            options.containerStart.appendChild(fadeItemStart);
        }
        else if (options.container) {
            options.container.appendChild(fadeItemStart);
        }
        if (options.containerEnd) {
            options.containerEnd.appendChild(fadeItemEnd);
        }
        else if (options.container) {
            options.container.appendChild(fadeItemEnd);
        }
        const hasFadeAtStart = () => {
            return slider.container.scrollLeft > fadeItemStart.offsetWidth;
        };
        const fadeAtStartOpacity = () => {
            const position = slider.container.scrollLeft;
            if (Math.floor(position) <= Math.floor(fadeItemStart.offsetWidth)) {
                return position / Math.max(fadeItemStart.offsetWidth, 1);
            }
            return 1;
        };
        const hasFadeAtEnd = () => {
            return Math.floor(slider.container.scrollLeft) < Math.floor(slider.getInclusiveScrollWidth() - slider.getInclusiveClientWidth() - fadeItemEnd.offsetWidth);
        };
        const fadeAtEndOpacity = () => {
            const position = slider.container.scrollLeft;
            const maxPosition = slider.getInclusiveScrollWidth() - slider.getInclusiveClientWidth();
            const maxFadePosition = maxPosition - fadeItemEnd.offsetWidth;
            if (Math.floor(position) >= Math.floor(maxFadePosition)) {
                return ((maxFadePosition - position) / Math.max(fadeItemEnd.offsetWidth, 1)) + 1;
            }
            return 1;
        };
        const update = () => {
            fadeItemStart.setAttribute('data-has-fade', hasFadeAtStart().toString());
            fadeItemStart.style.opacity = fadeAtStartOpacity().toString();
            fadeItemEnd.setAttribute('data-has-fade', hasFadeAtEnd().toString());
            fadeItemEnd.style.opacity = fadeAtEndOpacity().toString();
        };
        update();
        slider.on('created', update);
        slider.on('contentsChanged', update);
        slider.on('containerSizeChanged', update);
        slider.on('scrollEnd', update);
        slider.on('scrollStart', update);
        let requestId = 0;
        const debouncedUpdate = () => {
            if (requestId) {
                window.cancelAnimationFrame(requestId);
            }
            requestId = window.requestAnimationFrame(() => {
                update();
            });
        };
        slider.on('scroll', debouncedUpdate);
    };
}

export { FadePlugin as default };
