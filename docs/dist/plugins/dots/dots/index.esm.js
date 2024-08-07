const DEFAULT_TEXTS = {
    dotDescription: 'Page %d of %d',
};
const DEFAULT_CLASS_NAMES = {
    dotsContainer: 'overflow-slider__dots',
    dotsItem: 'overflow-slider__dot-item',
};
function DotsPlugin(args) {
    return (slider) => {
        var _a, _b;
        const options = {
            texts: Object.assign(Object.assign({}, DEFAULT_TEXTS), (args === null || args === void 0 ? void 0 : args.texts) || []),
            classNames: Object.assign(Object.assign({}, DEFAULT_CLASS_NAMES), (args === null || args === void 0 ? void 0 : args.classNames) || []),
            container: (_a = args === null || args === void 0 ? void 0 : args.container) !== null && _a !== void 0 ? _a : null,
        };
        const dots = document.createElement('div');
        dots.classList.add(options.classNames.dotsContainer);
        let pageFocused = null;
        const buildDots = () => {
            dots.setAttribute('data-has-content', slider.details.hasOverflow.toString());
            dots.innerHTML = '';
            const dotsList = document.createElement('ul');
            const pages = slider.details.slideCount;
            const currentItem = slider.activeSlideIdx;
            if (pages <= 1) {
                return;
            }
            for (let i = 0; i < pages; i++) {
                const dotListItem = document.createElement('li');
                const dot = document.createElement('button');
                dot.setAttribute('type', 'button');
                dot.setAttribute('class', options.classNames.dotsItem);
                dot.setAttribute('aria-label', options.texts.dotDescription.replace('%d', (i + 1).toString()).replace('%d', pages.toString()));
                dot.setAttribute('aria-pressed', (i === currentItem).toString());
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
                        const previousPage = currentItem - 1;
                        if (previousPage > 0) {
                            const matchingDot = dots.querySelector(`[data-item="${previousPage}"]`);
                            if (matchingDot) {
                                matchingDot.focus();
                            }
                            activateDot(previousPage);
                        }
                    }
                    if (e.key === 'ArrowRight') {
                        const nextPage = currentItem + 1;
                        if (nextPage <= pages) {
                            const matchingDot = dots.querySelector(`[data-item="${nextPage}"]`);
                            if (matchingDot) {
                                matchingDot.focus();
                            }
                            activateDot(nextPage);
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
        const activateDot = (item) => {
            slider.moveToSlide(item - 1);
        };
        buildDots();
        if (options.container) {
            options.container.appendChild(dots);
        }
        else {
            (_b = slider.container.parentNode) === null || _b === void 0 ? void 0 : _b.insertBefore(dots, slider.container.nextSibling);
        }
        slider.on('scrollEnd', buildDots);
        slider.on('contentsChanged', buildDots);
        slider.on('containerSizeChanged', buildDots);
    };
}

export { DotsPlugin as default };
