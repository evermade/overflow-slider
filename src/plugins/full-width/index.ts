import { Slider, DeepPartial } from '../../core/types';

const DEFAULT_TARGET_WIDTH = ( slider: Slider ) => slider.container.parentElement?.offsetWidth ?? window.innerWidth;

export type FullWidthOptions = {
	targetWidth: ( slider: Slider ) => number,
	addMarginBefore: boolean,
	addMarginAfter: boolean,
};

export default function FullWidthPlugin( args?: DeepPartial<FullWidthOptions> ) {
	return ( slider: Slider ) => {

		const options = <FullWidthOptions>{
			targetWidth: args?.targetWidth ?? null,
			addMarginBefore: args?.addMarginBefore ?? true,
			addMarginAfter: args?.addMarginAfter ?? true,
		};

		const update = () => {
			const slides = slider.container.querySelectorAll( slider.options.slidesSelector );

			if ( ! slides.length ) {
				return;
			}

			const firstSlide = slides[0] as HTMLElement;
			const lastSlide = slides[slides.length - 1] as HTMLElement;

			const marginAmount = Math.floor((window.innerWidth - getTargetWidth()) / 2);
			if ( options.addMarginBefore ) {
				firstSlide.style.marginInlineStart = `${marginAmount}px`;
			}
			if ( options.addMarginAfter ) {
				lastSlide.style.marginInlineEnd = `${marginAmount}px`;
			}
			slider.container.setAttribute( 'data-full-width-offset', marginAmount.toString() );
			setCSS();
		};

		const getTargetWidth = () => {
			if ( typeof options.targetWidth === 'function' ) {
				return options.targetWidth(slider);
			}
			if ( typeof slider.options.targetWidth  === 'function' ) {
				return slider.options.targetWidth(slider);
			}
			return DEFAULT_TARGET_WIDTH(slider);
		}

		const setCSS = () => {
			if ( typeof slider.options.targetWidth  === 'function' ) {
				slider.options.cssVariableContainer.style.setProperty('--slider-container-target-width', `${getTargetWidth()}px`);
			}
		};

		update();
		slider.on( 'contentsChanged', update );
		slider.on( 'containerSizeChanged', update );
		window.addEventListener( 'resize', update );
	};
}
