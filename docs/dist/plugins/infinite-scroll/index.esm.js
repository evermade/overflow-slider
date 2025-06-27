/**
 * @typedef {Object} InfiniteScrollOptions
 * @property {number} [lookAheadCount=1] Number of slides to look ahead when deciding to reparent.
 */
/**
 * Creates an infinite scroll plugin for a slider that re-parents multiple slides
 * before hitting the container edge, to avoid blank space and keep the same
 * active slide visible.
 *
 * @param {InfiniteScrollOptions} [options] Plugin configuration.
 * @returns {SliderPlugin} The configured slider plugin.
 */
function InfiniteScrollPlugin(options = {}) {
    const { lookAheadCount = 1 } = options;
    return (slider) => {
        const { container, options: sliderOpts } = slider;
        /**
         * Sum widths of the first or last N slides for lookahead.
         *
         * @param {HTMLElement[]} slides List of slide elements.
         * @param {boolean} fromEnd If true, sum last N; otherwise, first N.
         * @returns {number} Total pixel width of N slides.
         */
        function getLookAheadWidth(slides, fromEnd) {
            const slice = fromEnd
                ? slides.slice(-lookAheadCount)
                : slides.slice(0, lookAheadCount);
            return slice.reduce((total, slide) => total + slide.offsetWidth, 0);
        }
        /**
         * Handler for slider.scrollEnd event that re-parents slides
         * and retains the active slide element by recalculating its
         * new index after DOM shifts.
         */
        function onScroll() {
            const activeSlideIdx = slider.activeSlideIdx;
            const scrollLeft = slider.getScrollLeft();
            const viewportWidth = slider.getInclusiveClientWidth();
            const totalWidth = slider.getInclusiveScrollWidth();
            // Grab current slide elements
            let slides = Array.from(container.querySelectorAll(sliderOpts.slidesSelector));
            if (slides.length === 0)
                return;
            // Store reference to currently active slide element
            const activeSlideEl = slides[activeSlideIdx];
            const aheadRight = getLookAheadWidth(slides, false);
            const aheadLeft = getLookAheadWidth(slides, true);
            // 🐆 Tip: Batch DOM reads/writes inside requestAnimationFrame to avoid thrashing.
            if (scrollLeft + viewportWidth >= totalWidth - aheadRight) {
                for (let i = 0; i < lookAheadCount && slides.length; i++) {
                    container.append(slides.shift());
                }
            }
            else if (scrollLeft <= aheadLeft) {
                for (let i = 0; i < lookAheadCount && slides.length; i++) {
                    container.prepend(slides.pop());
                }
            }
            slider.setActiveSlideIdx();
            // Re-query slides after DOM mutation
            slides = Array.from(container.querySelectorAll(sliderOpts.slidesSelector));
            const newIndex = slides.indexOf(activeSlideEl);
            slides[newIndex];
            if (newIndex >= 0 && slider.canMoveToSlide(newIndex)) {
                slider.moveToSlide(newIndex);
            }
            else {
                slider.snapToClosestSlide('next');
            }
        }
        slider.on('scrollEnd', onScroll);
    };
}

export { InfiniteScrollPlugin as default };
