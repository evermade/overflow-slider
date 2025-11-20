const DEFAULT_CLASS_NAMES = {
    visible: 'is-visible',
    partlyVisible: 'is-partly-visible',
    hidden: 'is-hidden',
};
function ClassNamesPlugin(args) {
    return (slider) => {
        var _a, _b;
        const providedClassNames = (_a = args === null || args === void 0 ? void 0 : args.classNames) !== null && _a !== void 0 ? _a : args === null || args === void 0 ? void 0 : args.classnames;
        const options = {
            classNames: Object.assign(Object.assign({}, DEFAULT_CLASS_NAMES), providedClassNames !== null && providedClassNames !== void 0 ? providedClassNames : {}),
            freezeStateOnVisible: (_b = args === null || args === void 0 ? void 0 : args.freezeStateOnVisible) !== null && _b !== void 0 ? _b : false,
        };
        const slideStates = new WeakMap();
        const uniqueClassNames = Array.from(new Set(Object.values(options.classNames).filter((className) => Boolean(className))));
        const getTargetBounds = () => {
            const sliderRect = slider.container.getBoundingClientRect();
            const sliderWidth = sliderRect.width;
            if (!sliderWidth) {
                return { targetStart: sliderRect.left, targetEnd: sliderRect.right };
            }
            let targetWidth = 0;
            if (typeof slider.options.targetWidth === 'function') {
                try {
                    targetWidth = slider.options.targetWidth(slider);
                }
                catch (error) {
                    targetWidth = 0;
                }
            }
            if (!Number.isFinite(targetWidth) || targetWidth <= 0) {
                targetWidth = sliderWidth;
            }
            const effectiveTargetWidth = Math.min(targetWidth, sliderWidth);
            const offset = (sliderWidth - effectiveTargetWidth) / 2;
            const clampedOffset = Math.max(offset, 0);
            return {
                targetStart: sliderRect.left + clampedOffset,
                targetEnd: sliderRect.right - clampedOffset,
            };
        };
        const update = () => {
            const { targetStart, targetEnd } = getTargetBounds();
            slider.slides.forEach((slide) => {
                const slideRect = slide.getBoundingClientRect();
                const slideLeft = slideRect.left;
                const slideRight = slideRect.right;
                const tolerance = 2;
                const overlapsTarget = (slideRight - tolerance) > targetStart && (slideLeft + tolerance) < targetEnd;
                const fullyInsideTarget = (slideLeft + tolerance) >= targetStart && (slideRight - tolerance) <= targetEnd;
                let nextState = 'hidden';
                if (overlapsTarget) {
                    nextState = fullyInsideTarget ? 'visible' : 'partlyVisible';
                }
                const prevState = slideStates.get(slide);
                // If freezeStateOnVisible is enabled and slide was previously visible, keep it frozen
                if (options.freezeStateOnVisible && prevState === 'visible') {
                    return;
                }
                if (prevState === nextState) {
                    return;
                }
                const nextClass = options.classNames[nextState];
                if (prevState) {
                    const prevClass = options.classNames[prevState];
                    if (prevClass !== nextClass && prevClass) {
                        slide.classList.remove(prevClass);
                    }
                }
                else {
                    uniqueClassNames.forEach((className) => {
                        if (className !== nextClass) {
                            slide.classList.remove(className);
                        }
                    });
                }
                if (nextClass && !slide.classList.contains(nextClass)) {
                    slide.classList.add(nextClass);
                }
                slideStates.set(slide, nextState);
            });
        };
        slider.on('created', update);
        slider.on('pluginsLoaded', update);
        slider.on('fullWidthPluginUpdate', update);
        slider.on('contentsChanged', update);
        slider.on('containerSizeChanged', update);
        slider.on('detailsChanged', update);
        slider.on('scrollEnd', update);
        slider.on('scrollStart', update);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => update());
        });
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

export { ClassNamesPlugin as default };
