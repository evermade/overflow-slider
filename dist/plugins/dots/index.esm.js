const DEFAULT_TEXTS = {
    dotDescription: 'Page %d of %d',
};
const DEFAULT_CLASS_NAMES = {
    dotsContainer: 'overflow-slider__dots',
    dotsItem: 'overflow-slider__dot-item',
};
function DotsPlugin(args) {
    return (slider) => {
        var _a, _b, _c;
        const options = {
            type: (_a = args === null || args === void 0 ? void 0 : args.type) !== null && _a !== void 0 ? _a : 'slide',
            texts: Object.assign(Object.assign({}, DEFAULT_TEXTS), (args === null || args === void 0 ? void 0 : args.texts) || []),
            classNames: Object.assign(Object.assign({}, DEFAULT_CLASS_NAMES), (args === null || args === void 0 ? void 0 : args.classNames) || []),
            container: (_b = args === null || args === void 0 ? void 0 : args.container) !== null && _b !== void 0 ? _b : null,
        };
        const dots = document.createElement('div');
        dots.classList.add(options.classNames.dotsContainer);
        let pageFocused = null;
        const buildDots = () => {
            dots.setAttribute('data-has-content', slider.details.hasOverflow.toString());
            dots.innerHTML = '';
            console.log('buildDots');
            const dotsList = document.createElement('ul');
            const count = options.type === 'view' ? slider.details.amountOfPages : slider.details.slideCount;
            const currentIndex = options.type === 'view' ? slider.details.currentPage : slider.activeSlideIdx;
            if (count <= 1) {
                return;
            }
            for (let i = 0; i < count; i++) {
                const dotListItem = document.createElement('li');
                const dot = document.createElement('button');
                dot.setAttribute('type', 'button');
                dot.setAttribute('class', options.classNames.dotsItem);
                dot.setAttribute('aria-label', options.texts.dotDescription.replace('%d', (i + 1).toString()).replace('%d', count.toString()));
                dot.setAttribute('aria-pressed', (i === currentIndex).toString());
                dot.setAttribute('data-item', (i + 1).toString());
                dotListItem.appendChild(dot);
                dotsList.appendChild(dotListItem);
                dot.addEventListener('click', () => activateDot(i + 1));
                dot.addEventListener('focus', () => pageFocused = i + 1);
                dot.addEventListener('keydown', (e) => {
                    var _a;
                    const currentItemItem = dots.querySelector(`[aria-pressed="true"]`);
                    if (!currentItemItem) {
                        return;
                    }
                    const currentItem = parseInt((_a = currentItemItem.getAttribute('data-item')) !== null && _a !== void 0 ? _a : '1');
                    if (e.key === 'ArrowLeft') {
                        const previousIndex = currentItem - 1;
                        if (previousIndex > 0) {
                            const matchingDot = dots.querySelector(`[data-item="${previousIndex}"]`);
                            if (matchingDot) {
                                matchingDot.focus();
                            }
                            activateDot(previousIndex);
                        }
                    }
                    if (e.key === 'ArrowRight') {
                        const nextIndex = currentItem + 1;
                        if (nextIndex <= count) {
                            const matchingDot = dots.querySelector(`[data-item="${nextIndex}"]`);
                            if (matchingDot) {
                                matchingDot.focus();
                            }
                            activateDot(nextIndex);
                        }
                    }
                });
            }
            dots.appendChild(dotsList);
            // return focus to same page after rebuild
            if (pageFocused) {
                const matchingDot = dots.querySelector(`[data-item="${pageFocused}"]`);
                if (matchingDot) {
                    matchingDot.focus();
                }
            }
        };
        const activateDot = (index) => {
            console.log('activateDot', index, 'slider.details', slider.details);
            if (options.type === 'view') {
                const count = slider.details.amountOfPages;
                let targetPosition = slider.details.containerWidth * (index - 1);
                // For the last page, scroll to the maximum scroll position to ensure it activates
                if (index === count) {
                    const maxScroll = slider.details.scrollableAreaWidth - slider.details.containerWidth;
                    targetPosition = maxScroll;
                }
                const scrollLeft = slider.options.rtl ? -targetPosition : targetPosition;
                slider.container.scrollTo({
                    left: scrollLeft,
                    behavior: slider.options.scrollBehavior
                });
            }
            else {
                slider.moveToSlide(index - 1);
            }
        };
        buildDots();
        if (options.container) {
            options.container.appendChild(dots);
        }
        else {
            (_c = slider.container.parentNode) === null || _c === void 0 ? void 0 : _c.insertBefore(dots, slider.container.nextSibling);
        }
        slider.on('scrollEnd', buildDots);
        slider.on('contentsChanged', buildDots);
        slider.on('containerSizeChanged', buildDots);
        slider.on('detailsChanged', buildDots);
    };
}

export { DotsPlugin as default };
