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
        slider.container.addEventListener('mousedown', (e) => {
            if (!slider.details.hasOverflow) {
                return;
            }
            isMouseDown = true;
            startX = e.pageX - slider.container.offsetLeft;
            scrollLeft = slider.container.scrollLeft;
            // change cursor to grabbing
            slider.container.style.cursor = 'grabbing';
            slider.container.style.scrollSnapType = 'none';
            slider.container.style.scrollBehavior = 'auto';
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
            if (!slider.details.hasOverflow) {
                return;
            }
            isMouseDown = false;
            slider.container.style.cursor = '';
            // slider.container.style.scrollBehavior = slider.options.scrollBehavior;
            setTimeout(() => {
                slider.container.style.scrollSnapType = '';
                slider.container.style.scrollBehavior = '';
                const slides = slider.container.querySelectorAll(':scope > *');
                slides.forEach((slide) => {
                    slide.style.pointerEvents = '';
                });
            }, 50);
        });
        window.addEventListener('mousemove', (e) => {
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

export { DragScrollingPlugin as default };
