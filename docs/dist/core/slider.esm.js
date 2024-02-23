import details from './details.esm.js';
import { generateId, objectsAreEqual } from './utils.esm.js';

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
        setSlides();
        setDetails(true);
        setActiveSlideIdx();
        slider.on('contentsChanged', () => {
            setSlides();
            setDetails();
            setActiveSlideIdx();
        });
        slider.on('containerSizeChanged', () => setDetails());
        let requestId = 0;
        const setDetailsDebounce = () => {
            if (requestId) {
                window.cancelAnimationFrame(requestId);
            }
            requestId = window.requestAnimationFrame(() => {
                setDetails();
                setActiveSlideIdx();
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
        slider.container.setAttribute('data-ready', 'true');
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
    function setSlides() {
        slider.slides = Array.from(slider.container.querySelectorAll(slider.options.slidesSelector));
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
        else if (slideStart === 0) {
            scrollTarget = 0;
        }
        if (scrollTarget !== null) {
            slider.container.style.scrollSnapType = 'none';
            slider.container.scrollLeft = scrollTarget;
            // @todo resume scroll snapping but at least proximity gives a lot of trouble
            // and it's not really needed for this use case but it would be nice to have
            // it back in case it's needed. We need to calculate scrollLeft some other way
        }
    }
    function setActiveSlideIdx() {
        const sliderRect = slider.container.getBoundingClientRect();
        const scrollLeft = slider.container.scrollLeft;
        const slides = slider.slides;
        let activeSlideIdx = 0;
        for (let i = 0; i < slides.length; i++) {
            const slideRect = slides[i].getBoundingClientRect();
            const slideStart = slideRect.left - sliderRect.left + scrollLeft + getGapSize();
            if (slideStart > scrollLeft) {
                activeSlideIdx = i;
                break;
            }
        }
        const oldActiveSlideIdx = slider.activeSlideIdx;
        slider.activeSlideIdx = activeSlideIdx;
        if (oldActiveSlideIdx !== activeSlideIdx) {
            slider.emit('activeSlideChanged');
        }
    }
    function moveToSlide(idx) {
        const slide = slider.slides[idx];
        if (slide) {
            ensureSlideIsInView(slide);
        }
    }
    function getGapSize() {
        let gapSize = 0;
        if (slider.slides.length > 1) {
            const firstSlideRect = slider.slides[0].getBoundingClientRect();
            const secondSlideRect = slider.slides[1].getBoundingClientRect();
            gapSize = secondSlideRect.left - firstSlideRect.right;
        }
        return gapSize;
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
            // extend targetScrollPosition to include gap
            if (direction === 'prev') {
                fullSldeTargetScrollPosition = Math.max(0, targetScrollPosition - getGapSize());
            }
            else {
                fullSldeTargetScrollPosition = Math.min(slider.container.scrollWidth, targetScrollPosition + getGapSize());
            }
            if (direction === 'next') {
                let partialSlideFound = false;
                for (let slide of slider.slides) {
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
                for (let slide of slider.slides) {
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
        slider.container.style.scrollBehavior = slider.options.scrollBehavior;
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
        moveToSlide,
        on,
        options,
    };
    init();
    return slider;
}

export { Slider as default };
