import { Slider } from '../../core/types';

export type FadeOptions = {
	classNames: {
		fadeItem: string;
		fadeItemStart: string;
		fadeItemEnd: string;
	},
	container: HTMLElement | null,
	containerStart: HTMLElement | null,
	containerEnd: HTMLElement | null,
};

export default function FadePlugin( args: { [key: string]: any } ) {
	return ( slider: Slider ) => {

		const options = <FadeOptions>{
			classNames: {
				fadeItem: 'overflow-slider-fade',
				fadeItemStart: 'overflow-slider-fade--start',
				fadeItemEnd: 'overflow-slider-fade--end',
			},
			container: args?.container ?? null,
			containerStart: args?.containerStart ?? null,
			containerEnd: args?.containerEnd ?? null,
		};

		const fadeItemStart = document.createElement( 'div' );
		fadeItemStart.classList.add( options.classNames.fadeItem, options.classNames.fadeItemStart );
		fadeItemStart.setAttribute( 'aria-hidden', 'true' );
		fadeItemStart.setAttribute( 'tabindex', '-1' );

		const fadeItemEnd = document.createElement( 'div' );
		fadeItemEnd.classList.add( options.classNames.fadeItem, options.classNames.fadeItemEnd );
		fadeItemEnd.setAttribute( 'aria-hidden', 'true' );
		fadeItemEnd.setAttribute( 'tabindex', '-1' );

		if ( options.containerStart ) {
			options.containerStart.appendChild( fadeItemStart );
		} else if ( options.container ) {
			options.container.appendChild( fadeItemStart );
		}

		if ( options.containerEnd ) {
			options.containerEnd.appendChild( fadeItemEnd );
		} else if ( options.container ) {
			options.container.appendChild( fadeItemEnd );
		}

		const hasFadeAtStart = () => {
			return slider.container.scrollLeft > fadeItemStart.offsetWidth;
		}

		const fadeAtStartOpacity = () => {
			const position = slider.container.scrollLeft;
			if ( position <= fadeItemStart.offsetWidth ) {
				return position / Math.max(fadeItemStart.offsetWidth, 1);
			}
			return 1;
		}

		const hasFadeAtEnd = () => {
			return slider.container.scrollLeft < (slider.container.scrollWidth - slider.container.clientWidth - fadeItemEnd.offsetWidth);
		}

		const fadeAtEndOpacity = () => {
			const position = slider.container.scrollLeft;
			const maxPosition = slider.container.scrollWidth - slider.container.clientWidth;
			const maxFadePosition = maxPosition - fadeItemEnd.offsetWidth;
			if ( position >= maxFadePosition ) {
				return ( ( maxFadePosition - position ) / Math.max(fadeItemEnd.offsetWidth, 1) ) + 1;
			}
			return 1;
		}

		const update = () => {
			fadeItemStart.setAttribute( 'data-has-fade', hasFadeAtStart().toString() );
			fadeItemStart.style.opacity = fadeAtStartOpacity().toString();
			fadeItemEnd.setAttribute( 'data-has-fade', hasFadeAtEnd().toString() );
			fadeItemEnd.style.opacity = fadeAtEndOpacity().toString();
		};

		update();
		slider.on( 'created', update );
		slider.on( 'contentsChanged', update );
		slider.on( 'containerSizeChanged', update );
		slider.on( 'scrollEnd', update );
		slider.on( 'scrollStart', update );
		let requestId = 0;
		const debouncedUpdate = () => {
			if ( requestId ) {
				window.cancelAnimationFrame( requestId );
			}
			requestId = window.requestAnimationFrame(() => {
				update();
			});
		};
		slider.on('scroll', debouncedUpdate);


	};
}
