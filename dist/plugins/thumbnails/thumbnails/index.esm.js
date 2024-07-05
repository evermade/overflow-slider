function FullWidthPlugin(args) {
    return (slider) => {
        const options = {
            mainSlider: args.mainSlider,
        };
        const mainSlider = options.mainSlider;
        const setActiveThumbnail = (slide = null) => {
            if (slide === null && slider.slides.length > 0) {
                slide = slider.slides[0];
            }
            if (slide === null) {
                return;
            }
            // add aria-current to the clicked slide
            slider.slides.forEach((s) => {
                s.setAttribute('aria-current', 'false');
            });
            slide.setAttribute('aria-current', 'true');
        };
        const addClickListeners = () => {
            slider.slides.forEach((slide, index) => {
                slide.addEventListener('click', () => {
                    mainSlider.moveToSlide(index);
                    setActiveThumbnail(slide);
                });
            });
        };
        setActiveThumbnail();
        addClickListeners();
        mainSlider.on('scrollEnd', () => {
            setTimeout(() => {
                const mainActiveSlideIdx = mainSlider.activeSlideIdx;
                const thumbActiveSlideIdx = slider.activeSlideIdx;
                if (thumbActiveSlideIdx === mainActiveSlideIdx) {
                    return;
                }
                const activeThumbnail = slider.slides[mainActiveSlideIdx];
                setActiveThumbnail(activeThumbnail);
                slider.moveToSlide(mainActiveSlideIdx);
            }, 50);
        });
    };
}

export { FullWidthPlugin as default };
