function details(slider) {
    var _a;
    let instance;
    let hasOverflow = false;
    let slideCount = 0;
    let containerWidth = 0;
    let scrollableAreaWidth = 0;
    let amountOfPages = 0;
    let currentPage = 1;
    if (Math.floor(slider.getInclusiveScrollWidth()) > Math.floor(slider.getInclusiveClientWidth())) {
        hasOverflow = true;
    }
    slideCount = (_a = slider.slides.length) !== null && _a !== void 0 ? _a : 0;
    containerWidth = slider.container.offsetWidth;
    scrollableAreaWidth = slider.getInclusiveScrollWidth();
    amountOfPages = Math.ceil(scrollableAreaWidth / containerWidth);
    if (Math.floor(slider.container.scrollLeft) >= 0) {
        currentPage = Math.floor(slider.container.scrollLeft / containerWidth);
        // consider as last page if the scrollLeft + containerWidth is equal to scrollWidth
        if (Math.floor(slider.container.scrollLeft + containerWidth) === Math.floor(scrollableAreaWidth)) {
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

export { details as default };
