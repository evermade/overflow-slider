const DEFAULT_TEXTS = {
    buttonPrevious: 'Previous items',
    buttonNext: 'Next items',
};
const DEFAULT_ICONS = {
    prev: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8.6 3.4l-7.6 7.6 7.6 7.6 1.4-1.4-5-5h12.6v-2h-12.6l5-5z"/></svg>',
    next: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.4 3.4l-1.4 1.4 5 5h-12.6v2h12.6l-5 5 1.4 1.4 7.6-7.6z"/></svg>',
};
const DEFAULT_CLASS_NAMES = {
    navContainer: 'overflow-slider__arrows',
    prevButton: 'overflow-slider__arrows-button overflow-slider__arrows-button--prev',
    nextButton: 'overflow-slider__arrows-button overflow-slider__arrows-button--next',
};
function ArrowsPlugin(args) {
    return (slider) => {
        var _a, _b, _c, _d, _e, _f;
        const options = {
            texts: Object.assign(Object.assign({}, DEFAULT_TEXTS), (args === null || args === void 0 ? void 0 : args.texts) || []),
            icons: Object.assign(Object.assign({}, DEFAULT_ICONS), (args === null || args === void 0 ? void 0 : args.icons) || []),
            classNames: Object.assign(Object.assign({}, DEFAULT_CLASS_NAMES), (args === null || args === void 0 ? void 0 : args.classNames) || []),
            container: (_a = args === null || args === void 0 ? void 0 : args.container) !== null && _a !== void 0 ? _a : null,
            containerPrev: (_b = args === null || args === void 0 ? void 0 : args.containerPrev) !== null && _b !== void 0 ? _b : null,
            containerNext: (_c = args === null || args === void 0 ? void 0 : args.containerNext) !== null && _c !== void 0 ? _c : null,
        };
        const nav = document.createElement('div');
        nav.classList.add(options.classNames.navContainer);
        const prev = document.createElement('button');
        prev.setAttribute('class', options.classNames.prevButton);
        prev.setAttribute('type', 'button');
        prev.setAttribute('aria-label', options.texts.buttonPrevious);
        prev.setAttribute('aria-controls', (_d = slider.container.getAttribute('id')) !== null && _d !== void 0 ? _d : '');
        prev.setAttribute('data-type', 'prev');
        prev.innerHTML = options.icons.prev;
        prev.addEventListener('click', () => slider.moveToDirection('prev'));
        const next = document.createElement('button');
        next.setAttribute('class', options.classNames.nextButton);
        next.setAttribute('type', 'button');
        next.setAttribute('aria-label', options.texts.buttonNext);
        next.setAttribute('aria-controls', (_e = slider.container.getAttribute('id')) !== null && _e !== void 0 ? _e : '');
        next.setAttribute('data-type', 'next');
        next.innerHTML = options.icons.next;
        next.addEventListener('click', () => slider.moveToDirection('next'));
        // insert buttons to the nav
        nav.appendChild(prev);
        nav.appendChild(next);
        const update = () => {
            const scrollLeft = slider.container.scrollLeft;
            const scrollWidth = slider.container.scrollWidth;
            const clientWidth = slider.container.clientWidth;
            if (scrollLeft === 0) {
                prev.setAttribute('data-has-content', 'false');
            }
            else {
                prev.setAttribute('data-has-content', 'true');
            }
            if (scrollLeft + clientWidth >= scrollWidth) {
                next.setAttribute('data-has-content', 'false');
            }
            else {
                next.setAttribute('data-has-content', 'true');
            }
        };
        if (options.containerNext && options.containerPrev) {
            options.containerPrev.appendChild(prev);
            options.containerNext.appendChild(next);
        }
        else {
            if (options.container) {
                options.container.appendChild(nav);
            }
            else {
                (_f = slider.container.parentNode) === null || _f === void 0 ? void 0 : _f.insertBefore(nav, slider.container.nextSibling);
            }
        }
        update();
        slider.on('scroll', update);
        slider.on('contentsChanged', update);
        slider.on('containerSizeChanged', update);
    };
}

export { ArrowsPlugin as default };
