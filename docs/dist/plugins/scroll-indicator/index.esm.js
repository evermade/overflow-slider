const DEFAULT_CLASS_NAMES = {
    scrollIndicator: 'overflow-slider__scroll-indicator',
    scrollIndicatorBar: 'overflow-slider__scroll-indicator-bar',
    scrollIndicatorButton: 'overflow-slider__scroll-indicator-button',
};
function ScrollIndicatorPlugin(args) {
    return (slider) => {
        var _a, _b, _c;
        const options = {
            classNames: Object.assign(Object.assign({}, DEFAULT_CLASS_NAMES), (args === null || args === void 0 ? void 0 : args.classNames) || []),
            container: (_a = args === null || args === void 0 ? void 0 : args.container) !== null && _a !== void 0 ? _a : null,
        };
        const scrollbarContainer = document.createElement('div');
        scrollbarContainer.setAttribute('class', options.classNames.scrollIndicator);
        scrollbarContainer.setAttribute('tabindex', '0');
        scrollbarContainer.setAttribute('role', 'scrollbar');
        scrollbarContainer.setAttribute('aria-controls', (_b = slider.container.getAttribute('id')) !== null && _b !== void 0 ? _b : '');
        scrollbarContainer.setAttribute('aria-orientation', 'horizontal');
        scrollbarContainer.setAttribute('aria-valuemax', '100');
        scrollbarContainer.setAttribute('aria-valuemin', '0');
        scrollbarContainer.setAttribute('aria-valuenow', '0');
        const scrollbar = document.createElement('div');
        scrollbar.setAttribute('class', options.classNames.scrollIndicatorBar);
        const scrollbarButton = document.createElement('div');
        scrollbarButton.setAttribute('class', options.classNames.scrollIndicatorButton);
        scrollbarButton.setAttribute('data-is-grabbed', 'false');
        scrollbar.appendChild(scrollbarButton);
        scrollbarContainer.appendChild(scrollbar);
        const setDataAttributes = () => {
            scrollbarContainer.setAttribute('data-has-overflow', slider.details.hasOverflow.toString());
        };
        setDataAttributes();
        const getScrollbarButtonLeftOffset = () => {
            const contentRatio = scrollbarButton.offsetWidth / slider.details.containerWidth;
            const scrollAmount = slider.getScrollLeft() * contentRatio;
            if (slider.options.rtl) {
                return scrollbar.offsetWidth - scrollbarButton.offsetWidth - scrollAmount;
            }
            return scrollAmount;
        };
        let requestId = 0;
        const update = () => {
            if (requestId) {
                window.cancelAnimationFrame(requestId);
            }
            requestId = window.requestAnimationFrame(() => {
                const scrollbarButtonWidth = (slider.details.containerWidth / slider.container.scrollWidth) * 100;
                const scrollLeftInPortion = getScrollbarButtonLeftOffset();
                scrollbarButton.style.width = `${scrollbarButtonWidth}%`;
                scrollbarButton.style.transform = `translateX(${scrollLeftInPortion}px)`;
                const scrollLeft = slider.getScrollLeft();
                const scrollWidth = slider.getInclusiveScrollWidth();
                const containerWidth = slider.container.offsetWidth;
                const scrollPercentage = (scrollLeft / (scrollWidth - containerWidth)) * 100;
                scrollbarContainer.setAttribute('aria-valuenow', Math.round(Number.isNaN(scrollPercentage) ? 0 : scrollPercentage).toString());
            });
        };
        if (options.container) {
            options.container.appendChild(scrollbarContainer);
        }
        else {
            (_c = slider.container.parentNode) === null || _c === void 0 ? void 0 : _c.insertBefore(scrollbarContainer, slider.container.nextSibling);
        }
        update();
        slider.on('scroll', update);
        slider.on('contentsChanged', update);
        slider.on('containerSizeChanged', update);
        slider.on('detailsChanged', setDataAttributes);
        scrollbarContainer.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                slider.moveToDirection('prev');
            }
            else if (e.key === 'ArrowRight') {
                slider.moveToDirection('next');
            }
        });
        let isInteractionDown = false;
        let startX = 0;
        let scrollLeft = slider.getScrollLeft();
        scrollbarContainer.addEventListener('click', (e) => {
            if (e.target == scrollbarButton) {
                return;
            }
            const scrollbarButtonWidth = scrollbarButton.offsetWidth;
            const scrollbarButtonLeft = getScrollbarButtonLeftOffset();
            const scrollbarButtonRight = scrollbarButtonLeft + scrollbarButtonWidth;
            const clickX = e.pageX - scrollbarContainer.getBoundingClientRect().left;
            if (Math.floor(clickX) < Math.floor(scrollbarButtonLeft)) {
                console.log('move left');
                slider.moveToDirection(slider.options.rtl ? 'next' : 'prev');
            }
            else if (Math.floor(clickX) > Math.floor(scrollbarButtonRight)) {
                console.log('move right');
                slider.moveToDirection(slider.options.rtl ? 'prev' : 'next');
            }
        });
        const onInteractionDown = (e) => {
            isInteractionDown = true;
            const pageX = e.pageX || e.touches[0].pageX;
            startX = pageX - scrollbarContainer.offsetLeft;
            scrollLeft = slider.getScrollLeft();
            scrollbarButton.style.cursor = 'grabbing';
            scrollbarButton.setAttribute('data-is-grabbed', 'true');
            e.preventDefault();
            e.stopPropagation();
        };
        const onInteractionMove = (e) => {
            if (!isInteractionDown) {
                return;
            }
            e.preventDefault();
            const pageX = e.pageX || e.touches[0].pageX;
            const x = pageX - scrollbarContainer.offsetLeft;
            const scrollingFactor = slider.details.scrollableAreaWidth / scrollbarContainer.offsetWidth;
            const walk = (x - startX) * scrollingFactor;
            const distance = slider.options.rtl ? scrollLeft - walk : scrollLeft + walk;
            slider.setScrollLeft(distance);
        };
        const onInteractionUp = () => {
            isInteractionDown = false;
            scrollbarButton.style.cursor = '';
            scrollbarButton.setAttribute('data-is-grabbed', 'false');
        };
        scrollbarButton.addEventListener('mousedown', onInteractionDown);
        scrollbarButton.addEventListener('touchstart', onInteractionDown);
        window.addEventListener('mousemove', onInteractionMove);
        window.addEventListener('touchmove', onInteractionMove, { passive: false });
        window.addEventListener('mouseup', onInteractionUp);
        window.addEventListener('touchend', onInteractionUp);
    };
}

export { ScrollIndicatorPlugin as default };
