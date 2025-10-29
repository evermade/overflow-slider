import { Slider, DeepPartial } from '../../core/types';

const DEFAULT_TARGET_WIDTH = ( slider: Slider ) => slider.container.parentElement?.offsetWidth ?? window.innerWidth;

export type FullWidthOptions = {
	targetWidth?: ( slider: Slider ) => number,
	addMarginBefore: boolean,
	addMarginAfter: boolean,
};

export default function FullWidthPlugin( args?: DeepPartial<FullWidthOptions> ) {
	return ( slider: Slider ) => {

		const options = <FullWidthOptions>{
			targetWidth: args?.targetWidth ?? undefined,
			addMarginBefore: args?.addMarginBefore ?? true,
			addMarginAfter: args?.addMarginAfter ?? true,
		};

		if ( typeof slider.options.targetWidth !== 'function' ) {
			slider.options.targetWidth = options.targetWidth ?? DEFAULT_TARGET_WIDTH;
		}

		const resolveTargetWidth = () => {
			if ( typeof slider.options.targetWidth === 'function' ) {
				return slider.options.targetWidth;
			}
			return options.targetWidth ?? DEFAULT_TARGET_WIDTH;
		};

		const update = () => {
			const slides = slider.container.querySelectorAll( slider.options.slidesSelector );

			if ( ! slides.length ) {
				return;
			}

			const targetWidthFn = resolveTargetWidth();
			const rawMargin = ( window.innerWidth - targetWidthFn( slider ) ) / 2;
			const marginAmount = Math.max( 0, Math.floor( rawMargin ) );
			const marginValue = marginAmount ? `${marginAmount}px` : '';

			slides.forEach( ( slide ) => {
				const element = slide as HTMLElement;
				element.style.marginInlineStart = '';
				element.style.marginInlineEnd = '';
			} );

			const firstSlide = slides[0] as HTMLElement;
			const lastSlide = slides[slides.length - 1] as HTMLElement;

			if ( options.addMarginBefore ) {
				firstSlide.style.marginInlineStart = marginValue;
				slider.container.style.setProperty( 'scroll-padding-inline-start', marginValue || '0px' );
			}
			else {
				slider.container.style.removeProperty( 'scroll-padding-inline-start' );
			}
			if ( options.addMarginAfter ) {
				lastSlide.style.marginInlineEnd = marginValue;
				slider.container.style.setProperty( 'scroll-padding-inline-end', marginValue || '0px' );
			}
			else {
				slider.container.style.removeProperty( 'scroll-padding-inline-end' );
			}

			slider.container.setAttribute( 'data-full-width-offset', `${marginAmount}` );
			setCSS( targetWidthFn );
			slider.emit( 'fullWidthPluginUpdate' );
		};

		const setCSS = ( targetWidthFn: ( slider: Slider ) => number ) => {
			const width = targetWidthFn( slider );
			slider.options.cssVariableContainer.style.setProperty('--slider-container-target-width', `${width}px`);
		};

		update();
		slider.on( 'contentsChanged', update );
		slider.on( 'containerSizeChanged', update );
		window.addEventListener( 'resize', update );
	};
}
