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
        // add data attribute to container
        slider.container.setAttribute('data-has-drag-scrolling', 'true');
        const mouseDown = (e) => {
            if (!slider.details.hasOverflow) {
                return;
            }
            if (!slider.container.contains(e.target)) {
                return;
            }
            isMouseDown = true;
            startX = e.pageX - slider.container.offsetLeft;
            scrollLeft = slider.container.scrollLeft;
            // change cursor to grabbing
            slider.container.style.cursor = 'grabbing';
            slider.container.style.scrollSnapType = 'none';
            slider.container.style.scrollBehavior = 'auto';
            // prevent focus going to the slides
            e.preventDefault();
            e.stopPropagation();
        };
        const mouseMove = (e) => {
            if (!slider.details.hasOverflow) {
                return;
            }
            if (!isMouseDown) {
                return;
            }
            e.preventDefault();
            const x = e.pageX - slider.container.offsetLeft;
            const walk = (x - startX);
            slider.container.scrollLeft = scrollLeft - walk;
            const absWalk = Math.abs(walk);
            const slides = slider.container.querySelectorAll(slider.options.slidesSelector);
            const pointerEvents = absWalk > options.draggedDistanceThatPreventsClick ? 'none' : '';
            slides.forEach((slide) => {
                slide.style.pointerEvents = pointerEvents;
            });
        };
        const mouseUp = () => {
            if (!slider.details.hasOverflow) {
                return;
            }
            isMouseDown = false;
            slider.container.style.cursor = '';
            setTimeout(() => {
                slider.container.style.scrollSnapType = '';
                slider.container.style.scrollBehavior = '';
                const slides = slider.container.querySelectorAll(slider.options.slidesSelector);
                slides.forEach((slide) => {
                    slide.style.pointerEvents = '';
                });
            }, 50);
        };
        window.addEventListener('mousedown', mouseDown);
        window.addEventListener('mousemove', mouseMove);
        window.addEventListener('mouseup', mouseUp);
    };
}

export { DragScrollingPlugin as default };
