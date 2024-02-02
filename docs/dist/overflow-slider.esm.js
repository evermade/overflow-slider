function details(slider) {
    let instance;
    let hasOverflow = false;
    let slideCount = 0;
    let containerWidth = 0;
    let scrollableAreaWidth = 0;
    let amountOfPages = 0;
    let currentPage = 1;
    if (slider.container.scrollWidth > slider.container.clientWidth) {
        hasOverflow = true;
    }
    slideCount = Array.from(slider.container.querySelectorAll(':scope > *')).length;
    containerWidth = slider.container.offsetWidth;
    scrollableAreaWidth = slider.container.scrollWidth;
    amountOfPages = Math.ceil(scrollableAreaWidth / containerWidth);
    if (slider.container.scrollLeft >= 0) {
        currentPage = Math.floor(slider.container.scrollLeft / containerWidth);
        // consider as last page if the scrollLeft + containerWidth is equal to scrollWidth
        if (slider.container.scrollLeft + containerWidth === scrollableAreaWidth) {
            currentPage = amountOfPages - 1;
        }
    }
    instance = {
        hasOverflow,
        slideCount,
        containerWidth,
        scrollableAreaWidth,
        amountOfPages,
        currentPage,
    };
    return instance;
}

function generateId(prefix, i = 1) {
    const id = `${prefix}-${i}`;
    if (document.getElementById(id)) {
        return generateId(prefix, i + 1);
    }
    return id;
}
function objectsAreEqual(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (let key of keys1) {
        if (obj2.hasOwnProperty(key) === false || obj1[key] !== obj2[key]) {
            return false;
        }
    }
    return true;
}

function Slider(container, options, plugins) {
    let slider;
    let subs = {};
    function init() {
        slider.container = container;
        // ensure container has id
        let containerId = container.getAttribute('id');
        if (containerId === null) {
            containerId = generateId('overflow-slider');
            container.setAttribute('id', containerId);
        }
        setDetails(true);
        slider.on('contentsChanged', () => setDetails());
        slider.on('containerSizeChanged', () => setDetails());
        let requestId = 0;
        const setDetailsDebounce = () => {
            if (requestId) {
                window.cancelAnimationFrame(requestId);
            }
            requestId = window.requestAnimationFrame(() => {
                setDetails();
            });
        };
        slider.on('scroll', setDetailsDebounce);
        addEventListeners();
        setDataAttributes();
        setCSSVariables();
        if (plugins) {
            for (const plugin of plugins) {
                plugin(slider);
            }
        }
        slider.on('detailsChanged', () => {
            setDataAttributes();
            setCSSVariables();
        });
        slider.emit('created');
    }
    function setDetails(isInit = false) {
        const oldDetails = slider.details;
        const newDetails = details(slider);
        slider.details = newDetails;
        if (!isInit && !objectsAreEqual(oldDetails, newDetails)) {
            slider.emit('detailsChanged');
        }
        else if (isInit) {
            slider.emit('detailsChanged');
        }
    }
    function addEventListeners() {
        // changes to DOM
        const observer = new MutationObserver(() => slider.emit('contentsChanged'));
        observer.observe(slider.container, { childList: true });
        // container size changes
        const resizeObserver = new ResizeObserver(() => slider.emit('containerSizeChanged'));
        resizeObserver.observe(slider.container);
        // scroll event with debouncing
        slider.container.addEventListener('scroll', () => slider.emit('scroll'));
        // Listen for mouse down and touch start events on the document
        // This handles both mouse clicks and touch interactions
        let wasInteractedWith = false;
        slider.container.addEventListener('mousedown', () => {
            wasInteractedWith = true;
        });
        slider.container.addEventListener('touchstart', () => {
            wasInteractedWith = true;
        }, { passive: true });
        slider.container.addEventListener('focusin', (e) => {
            // move target parents as long as they are not the container
            // but only if focus didn't start from mouse or touch
            if (!wasInteractedWith) {
                let target = e.target;
                while (target.parentElement !== slider.container) {
                    if (target.parentElement) {
                        target = target.parentElement;
                    }
                    else {
                        break;
                    }
                }
                ensureSlideIsInView(target);
            }
            wasInteractedWith = false;
        });
    }
    function setCSSVariables() {
        slider.container.style.setProperty('--slider-container-width', `${slider.details.containerWidth}px`);
        slider.container.style.setProperty('--slider-scrollable-width', `${slider.details.scrollableAreaWidth}px`);
        slider.container.style.setProperty('--slider-slides-count', `${slider.details.slideCount}`);
    }
    function setDataAttributes() {
        slider.container.setAttribute('data-has-overflow', slider.details.hasOverflow ? 'true' : 'false');
    }
    function ensureSlideIsInView(slide) {
        const slideRect = slide.getBoundingClientRect();
        const sliderRect = slider.container.getBoundingClientRect();
        const containerWidth = slider.container.offsetWidth;
        const scrollLeft = slider.container.scrollLeft;
        const slideStart = slideRect.left - sliderRect.left + scrollLeft;
        const slideEnd = slideStart + slideRect.width;
        let scrollTarget = null;
        if (slideStart < scrollLeft) {
            scrollTarget = slideStart;
        }
        else if (slideEnd > scrollLeft + containerWidth) {
            scrollTarget = slideEnd - containerWidth;
        }
        if (scrollTarget) {
            slider.container.style.scrollSnapType = 'none';
            slider.container.scrollLeft = scrollTarget;
            // @todo resume scroll snapping but at least proximity gives a lot of trouble
            // and it's not really needed for this use case but it would be nice to have
            // it back in case it's needed. We need to calculate scrollLeft some other way
        }
    }
    function moveToDirection(direction = "prev") {
        const scrollStrategy = slider.options.scrollStrategy;
        const scrollLeft = slider.container.scrollLeft;
        const sliderRect = slider.container.getBoundingClientRect();
        const containerWidth = slider.container.offsetWidth;
        let targetScrollPosition = scrollLeft;
        if (direction === 'prev') {
            targetScrollPosition = Math.max(0, scrollLeft - slider.container.offsetWidth);
        }
        else if (direction === 'next') {
            targetScrollPosition = Math.min(slider.container.scrollWidth, scrollLeft + slider.container.offsetWidth);
        }
        if (scrollStrategy === 'fullSlide') {
            let fullSldeTargetScrollPosition = null;
            const slides = Array.from(slider.container.querySelectorAll(':scope > *'));
            let gapSize = 0;
            if (slides.length > 1) {
                const firstSlideRect = slides[0].getBoundingClientRect();
                const secondSlideRect = slides[1].getBoundingClientRect();
                gapSize = secondSlideRect.left - firstSlideRect.right;
            }
            // extend targetScrollPosition to include gap
            if (direction === 'prev') {
                fullSldeTargetScrollPosition = Math.max(0, targetScrollPosition - gapSize);
            }
            else {
                fullSldeTargetScrollPosition = Math.min(slider.container.scrollWidth, targetScrollPosition + gapSize);
            }
            if (direction === 'next') {
                let partialSlideFound = false;
                for (let slide of slides) {
                    const slideRect = slide.getBoundingClientRect();
                    const slideStart = slideRect.left - sliderRect.left + scrollLeft;
                    const slideEnd = slideStart + slideRect.width;
                    if (slideStart < targetScrollPosition && slideEnd > targetScrollPosition) {
                        fullSldeTargetScrollPosition = slideStart;
                        partialSlideFound = true;
                        break;
                    }
                }
                if (!partialSlideFound) {
                    fullSldeTargetScrollPosition = Math.min(targetScrollPosition, slider.container.scrollWidth - slider.container.offsetWidth);
                }
                if (fullSldeTargetScrollPosition && fullSldeTargetScrollPosition > scrollLeft) {
                    targetScrollPosition = fullSldeTargetScrollPosition;
                }
            }
            else {
                let partialSlideFound = false;
                for (let slide of slides) {
                    const slideRect = slide.getBoundingClientRect();
                    const slideStart = slideRect.left - sliderRect.left + scrollLeft;
                    const slideEnd = slideStart + slideRect.width;
                    if (slideStart < scrollLeft && slideEnd > scrollLeft) {
                        fullSldeTargetScrollPosition = slideEnd - containerWidth;
                        partialSlideFound = true;
                        break;
                    }
                }
                if (!partialSlideFound) {
                    fullSldeTargetScrollPosition = Math.max(0, scrollLeft - containerWidth);
                }
                if (fullSldeTargetScrollPosition && fullSldeTargetScrollPosition < scrollLeft) {
                    targetScrollPosition = fullSldeTargetScrollPosition;
                }
            }
        }
        slider.container.style.scrollBehavior = 'smooth';
        slider.container.scrollLeft = targetScrollPosition;
        setTimeout(() => slider.container.style.scrollBehavior = '', 50);
    }
    function on(name, cb) {
        if (!subs[name]) {
            subs[name] = [];
        }
        subs[name].push(cb);
    }
    function emit(name) {
        var _a;
        if (subs && subs[name]) {
            subs[name].forEach(cb => {
                cb(slider);
            });
        }
        const optionCallBack = (_a = slider === null || slider === void 0 ? void 0 : slider.options) === null || _a === void 0 ? void 0 : _a[name];
        if (typeof optionCallBack === 'function') {
            optionCallBack(slider);
        }
    }
    slider = {
        emit,
        moveToDirection,
        on,
        options,
    };
    init();
    return slider;
}

function OverflowSlider(container, options, plugins) {
    try {
        // check that container HTML element
        if (!(container instanceof Element)) {
            throw new Error(`Container must be HTML element, found ${typeof container}`);
        }
        const defaults = {
            scrollBehavior: "smooth",
            scrollStrategy: "fullSlide",
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

const DEFAULT_TEXTS$2 = {
    skipList: 'Skip list'
};
const DEFAULT_CLASS_NAMES$3 = {
    skipLink: 'screen-reader-text',
    skipLinkTarget: 'overflow-slider__skip-link-target',
};
function SkipLinksPlugin(args) {
    return (slider) => {
        var _a, _b, _c, _d, _e, _f;
        const options = {
            texts: Object.assign(Object.assign({}, DEFAULT_TEXTS$2), (args === null || args === void 0 ? void 0 : args.texts) || []),
            classNames: Object.assign(Object.assign({}, DEFAULT_CLASS_NAMES$3), (args === null || args === void 0 ? void 0 : args.classNames) || []),
            containerBefore: (_a = args === null || args === void 0 ? void 0 : args.containerAfter) !== null && _a !== void 0 ? _a : null,
            containerAfter: (_b = args === null || args === void 0 ? void 0 : args.containerAfter) !== null && _b !== void 0 ? _b : null,
        };
        const skipId = generateId('overflow-slider-skip');
        const skipLinkEl = document.createElement('a');
        skipLinkEl.setAttribute('href', `#${skipId}`);
        skipLinkEl.textContent = options.texts.skipList;
        skipLinkEl.classList.add(options.classNames.skipLink);
        const skipTargetEl = document.createElement('div');
        skipTargetEl.setAttribute('id', skipId);
        skipTargetEl.setAttribute('tabindex', '-1');
        if (options.containerBefore) {
            (_c = options.containerBefore.parentNode) === null || _c === void 0 ? void 0 : _c.insertBefore(skipLinkEl, options.containerBefore);
        }
        else {
            (_d = slider.container.parentNode) === null || _d === void 0 ? void 0 : _d.insertBefore(skipLinkEl, slider.container);
        }
        if (options.containerAfter) {
            (_e = options.containerAfter.parentNode) === null || _e === void 0 ? void 0 : _e.insertBefore(skipTargetEl, options.containerAfter.nextSibling);
        }
        else {
            (_f = slider.container.parentNode) === null || _f === void 0 ? void 0 : _f.insertBefore(skipTargetEl, slider.container.nextSibling);
        }
    };
}

const DEFAULT_TEXTS$1 = {
    buttonPrevious: 'Previous items',
    buttonNext: 'Next items',
};
const DEFAULT_ICONS = {
    prev: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8.6 3.4l-7.6 7.6 7.6 7.6 1.4-1.4-5-5h12.6v-2h-12.6l5-5z"/></svg>',
    next: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.4 3.4l-1.4 1.4 5 5h-12.6v2h12.6l-5 5 1.4 1.4 7.6-7.6z"/></svg>',
};
const DEFAULT_CLASS_NAMES$2 = {
    navContainer: 'overflow-slider__arrows',
    prevButton: 'overflow-slider__arrows-button overflow-slider__arrows-button--prev',
    nextButton: 'overflow-slider__arrows-button overflow-slider__arrows-button--next',
};
function ArrowsPlugin(args) {
    return (slider) => {
        var _a, _b, _c, _d;
        const options = {
            texts: Object.assign(Object.assign({}, DEFAULT_TEXTS$1), (args === null || args === void 0 ? void 0 : args.texts) || []),
            icons: Object.assign(Object.assign({}, DEFAULT_ICONS), (args === null || args === void 0 ? void 0 : args.icons) || []),
            classNames: Object.assign(Object.assign({}, DEFAULT_CLASS_NAMES$2), (args === null || args === void 0 ? void 0 : args.classNames) || []),
            container: (_a = args === null || args === void 0 ? void 0 : args.container) !== null && _a !== void 0 ? _a : null,
        };
        const nav = document.createElement('div');
        nav.classList.add(options.classNames.navContainer);
        const prev = document.createElement('button');
        prev.setAttribute('class', options.classNames.prevButton);
        prev.setAttribute('type', 'button');
        prev.setAttribute('aria-label', options.texts.buttonPrevious);
        prev.setAttribute('aria-controls', (_b = slider.container.getAttribute('id')) !== null && _b !== void 0 ? _b : '');
        prev.setAttribute('data-type', 'prev');
        prev.innerHTML = options.icons.prev;
        prev.addEventListener('click', () => slider.moveToDirection('prev'));
        const next = document.createElement('button');
        next.setAttribute('class', options.classNames.nextButton);
        next.setAttribute('type', 'button');
        next.setAttribute('aria-label', options.texts.buttonNext);
        next.setAttribute('aria-controls', (_c = slider.container.getAttribute('id')) !== null && _c !== void 0 ? _c : '');
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
        if (options.container) {
            options.container.appendChild(nav);
        }
        else {
            (_d = slider.container.parentNode) === null || _d === void 0 ? void 0 : _d.insertBefore(nav, slider.container.nextSibling);
        }
        update();
        slider.on('scroll', update);
        slider.on('contentsChanged', update);
        slider.on('containerSizeChanged', update);
    };
}

const DEFAULT_CLASS_NAMES$1 = {
    scrollIndicator: 'overflow-slider__scroll-indicator',
    scrollIndicatorBar: 'overflow-slider__scroll-indicator-bar',
    scrollIndicatorButton: 'overflow-slider__scroll-indicator-button',
};
function ScrollIndicatorPlugin(args) {
    return (slider) => {
        var _a, _b, _c;
        const options = {
            classNames: Object.assign(Object.assign({}, DEFAULT_CLASS_NAMES$1), (args === null || args === void 0 ? void 0 : args.classNames) || []),
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
            const scrollbarRatio = slider.container.offsetWidth / slider.container.scrollWidth;
            return slider.container.scrollLeft * scrollbarRatio;
        };
        // scrollbarbutton width and position is calculated based on the scroll position and available width
        let requestId = 0;
        const update = () => {
            if (requestId) {
                window.cancelAnimationFrame(requestId);
            }
            requestId = window.requestAnimationFrame(() => {
                const scrollbarButtonWidth = (slider.container.offsetWidth / slider.container.scrollWidth) * 100;
                const scrollLeftInPortion = getScrollbarButtonLeftOffset();
                scrollbarButton.style.width = `${scrollbarButtonWidth}%`;
                scrollbarButton.style.transform = `translateX(${scrollLeftInPortion}px)`;
                // aria-valuenow
                const scrollLeft = slider.container.scrollLeft;
                const scrollWidth = slider.container.scrollWidth;
                const containerWidth = slider.container.offsetWidth;
                const scrollPercentage = (scrollLeft / (scrollWidth - containerWidth)) * 100;
                scrollbarContainer.setAttribute('aria-valuenow', Math.round(Number.isNaN(scrollPercentage) ? 0 : scrollPercentage).toString());
            });
        };
        // insert to DOM
        if (options.container) {
            options.container.appendChild(scrollbarContainer);
        }
        else {
            (_c = slider.container.parentNode) === null || _c === void 0 ? void 0 : _c.insertBefore(scrollbarContainer, slider.container.nextSibling);
        }
        // update the scrollbar when the slider is scrolled
        update();
        slider.on('scroll', update);
        slider.on('contentsChanged', update);
        slider.on('containerSizeChanged', update);
        slider.on('detailsChanged', setDataAttributes);
        // handle arrow keys while focused
        scrollbarContainer.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                slider.moveToDirection('prev');
            }
            else if (e.key === 'ArrowRight') {
                slider.moveToDirection('next');
            }
        });
        // handle click to before or after the scrollbar button
        scrollbarContainer.addEventListener('click', (e) => {
            const scrollbarButtonWidth = scrollbarButton.offsetWidth;
            const scrollbarButtonLeft = getScrollbarButtonLeftOffset();
            const scrollbarButtonRight = scrollbarButtonLeft + scrollbarButtonWidth;
            const clickX = e.pageX - scrollbarContainer.offsetLeft;
            if (clickX < scrollbarButtonLeft) {
                slider.moveToDirection('prev');
            }
            else if (clickX > scrollbarButtonRight) {
                slider.moveToDirection('next');
            }
        });
        // make scrollbar button draggable via mouse/touch and update the scroll position
        let isMouseDown = false;
        let startX = 0;
        let scrollLeft = 0;
        scrollbarButton.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            startX = e.pageX - scrollbarContainer.offsetLeft;
            scrollLeft = slider.container.scrollLeft;
            // change cursor to grabbing
            scrollbarButton.style.cursor = 'grabbing';
            slider.container.style.scrollSnapType = 'none';
            scrollbarButton.setAttribute('data-is-grabbed', 'true');
            e.preventDefault();
            e.stopPropagation();
        });
        window.addEventListener('mouseup', () => {
            isMouseDown = false;
            scrollbarButton.style.cursor = '';
            slider.container.style.scrollSnapType = '';
            scrollbarButton.setAttribute('data-is-grabbed', 'false');
        });
        window.addEventListener('mousemove', (e) => {
            if (!isMouseDown) {
                return;
            }
            e.preventDefault();
            const x = e.pageX - scrollbarContainer.offsetLeft;
            const scrollingFactor = slider.container.scrollWidth / scrollbarContainer.offsetWidth;
            const walk = (x - startX) * scrollingFactor;
            slider.container.scrollLeft = scrollLeft + walk;
        });
    };
}

const DEFAULT_DRAGGED_DISTANCE_THAT_PREVENTS_CLICK = 20;
function DragScrollingPlugin(args) {
    var _a;
    const options = {
        draggedDistanceThatPreventsClick: (_a = args === null || args === void 0 ? void 0 : args.draggedDistanceThatPreventsClick) !== null && _a !== void 0 ? _a : DEFAULT_DRAGGED_DISTANCE_THAT_PREVENTS_CLICK,
    };
    return (slider) => {
        let isMouseDown = false;
        let startX = 0;
        let scrollLeft = 0;
        const hasOverflow = () => {
            return slider.details.hasOverflow;
        };
        slider.container.addEventListener('mousedown', (e) => {
            if (!hasOverflow()) {
                return;
            }
            isMouseDown = true;
            startX = e.pageX - slider.container.offsetLeft;
            scrollLeft = slider.container.scrollLeft;
            // change cursor to grabbing
            slider.container.style.cursor = 'grabbing';
            slider.container.style.scrollSnapType = 'none';
            // prevent pointer events on the slides
            // const slides = slider.container.querySelectorAll( ':scope > *' );
            // slides.forEach((slide) => {
            // 	(<HTMLElement>slide).style.pointerEvents = 'none';
            // });
            // prevent focus going to the slides
            // e.preventDefault();
            // e.stopPropagation();
        });
        window.addEventListener('mouseup', () => {
            if (!hasOverflow()) {
                return;
            }
            isMouseDown = false;
            slider.container.style.cursor = '';
            slider.container.style.scrollSnapType = '';
            setTimeout(() => {
                const slides = slider.container.querySelectorAll(':scope > *');
                slides.forEach((slide) => {
                    slide.style.pointerEvents = '';
                });
            }, 50);
        });
        window.addEventListener('mousemove', (e) => {
            if (!hasOverflow()) {
                return;
            }
            if (!isMouseDown) {
                return;
            }
            e.preventDefault();
            const x = e.pageX - slider.container.offsetLeft;
            const walk = (x - startX);
            slider.container.scrollLeft = scrollLeft - walk;
            // if walk is more than 30px, don't allow click event
            // e.preventDefault();
            const absWalk = Math.abs(walk);
            const slides = slider.container.querySelectorAll(':scope > *');
            const pointerEvents = absWalk > options.draggedDistanceThatPreventsClick ? 'none' : '';
            slides.forEach((slide) => {
                slide.style.pointerEvents = pointerEvents;
            });
        });
    };
}

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
            const pages = slider.details.amountOfPages;
            const currentPage = slider.details.currentPage;
            if (pages <= 1) {
                return;
            }
            for (let i = 0; i < pages; i++) {
                const dotListItem = document.createElement('li');
                const dot = document.createElement('button');
                dot.setAttribute('type', 'button');
                dot.setAttribute('class', options.classNames.dotsItem);
                dot.setAttribute('aria-label', options.texts.dotDescription.replace('%d', (i + 1).toString()).replace('%d', pages.toString()));
                dot.setAttribute('aria-pressed', (i === currentPage).toString());
                dot.setAttribute('data-page', (i + 1).toString());
                dotListItem.appendChild(dot);
                dotsList.appendChild(dotListItem);
                dot.addEventListener('click', () => activateDot(i + 1));
                dot.addEventListener('focus', () => pageFocused = i + 1);
                dot.addEventListener('keydown', (e) => {
                    var _a;
                    const currentPageItem = dots.querySelector(`[aria-pressed="true"]`);
                    if (!currentPageItem) {
                        return;
                    }
                    const currentPage = parseInt((_a = currentPageItem.getAttribute('data-page')) !== null && _a !== void 0 ? _a : '1');
                    if (e.key === 'ArrowLeft') {
                        const previousPage = currentPage - 1;
                        if (previousPage > 0) {
                            const matchingDot = dots.querySelector(`[data-page="${previousPage}"]`);
                            if (matchingDot) {
                                matchingDot.focus();
                            }
                            activateDot(previousPage);
                        }
                    }
                    if (e.key === 'ArrowRight') {
                        const nextPage = currentPage + 1;
                        if (nextPage <= pages) {
                            const matchingDot = dots.querySelector(`[data-page="${nextPage}"]`);
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
                const matchingDot = dots.querySelector(`[data-page="${pageFocused}"]`);
                if (matchingDot) {
                    matchingDot.focus();
                }
            }
        };
        const activateDot = (page) => {
            const scrollTargetPosition = slider.details.containerWidth * (page - 1);
            slider.container.style.scrollBehavior = slider.options.scrollBehavior;
            slider.container.style.scrollSnapType = 'none';
            slider.container.scrollLeft = scrollTargetPosition;
            slider.container.style.scrollBehavior = '';
            slider.container.style.scrollSnapType = '';
        };
        buildDots();
        if (options.container) {
            options.container.appendChild(dots);
        }
        else {
            (_b = slider.container.parentNode) === null || _b === void 0 ? void 0 : _b.insertBefore(dots, slider.container.nextSibling);
        }
        slider.on('detailsChanged', () => {
            buildDots();
        });
    };
}

export { ArrowsPlugin, DotsPlugin, DragScrollingPlugin, OverflowSlider, ScrollIndicatorPlugin, SkipLinksPlugin };
