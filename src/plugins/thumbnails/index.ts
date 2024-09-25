import { Slider } from '../../core/types';

export type ThumbnailsOptions = {
	mainSlider: Slider,
};

export default function FullWidthPlugin( args: { [key: string]: unknown } ) {
	return ( slider: Slider ) => {

		const options = <ThumbnailsOptions>{
			mainSlider: args.mainSlider,
		};

		const mainSlider = options.mainSlider;

		const setActiveThumbnail = (slide: HTMLElement | null = null) => {
			if ( slide === null && slider.slides.length > 0 ) {
				slide = slider.slides[0] as HTMLElement;
			}
			if ( slide === null ) {
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

		mainSlider.on( 'scrollEnd', () => {
			setTimeout(() => {
				const mainActiveSlideIdx = mainSlider.activeSlideIdx;
				const thumbActiveSlideIdx = slider.activeSlideIdx;
				if ( thumbActiveSlideIdx === mainActiveSlideIdx ) {
					return;
				}
				const activeThumbnail = slider.slides[mainActiveSlideIdx] as HTMLElement;
				setActiveThumbnail(activeThumbnail);
				slider.moveToSlide(mainActiveSlideIdx);
			}, 50);
		});

	};
}
