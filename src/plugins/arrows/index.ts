import { Slider } from '../../core/types';

const DEFAULT_TEXTS = {
	buttonPrevious: 'Previous items',
	buttonNext: 'Next items',
};

const DEFAULT_ICONS = {
	prev: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8.6 3.4l-7.6 7.6 7.6 7.6 1.4-1.4-5-5h12.6v-2h-12.6l5-5z"/></svg>',
	next: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.4 3.4l-1.4 1.4 5 5h-12.6v2h12.6l-5 5 1.4 1.4 7.6-7.6z"/></svg>',
};

const DEFAULT_CLASS_NAMES = {
	navContainer: 'overflow-slider__arrows',
	prevButton: 'overflow-slider__arrows-button overflow-slider__arrows-button--prev',
	nextButton: 'overflow-slider__arrows-button overflow-slider__arrows-button--next',
};

export type ArrowsOptions = {
	texts: {
		buttonPrevious: string;
		buttonNext: string;
	},
	icons: {
		prev: string;
		next: string;
	},
	classNames: {
		navContainer: string;
		prevButton: string;
		nextButton: string;
	},
	container: HTMLElement | null,
	containerPrev: HTMLElement | null,
	containerNext: HTMLElement | null,
};

export default function ArrowsPlugin( args: { [key: string]: unknown } ) {
	return ( slider: Slider ) => {

		const options = <ArrowsOptions>{
			texts: {
				...DEFAULT_TEXTS,
				...args?.texts || []
			},
			icons: {
				...DEFAULT_ICONS,
				...args?.icons || []
			},
			classNames: {
				...DEFAULT_CLASS_NAMES,
				...args?.classNames || []
			},
			container: args?.container ?? null,
			containerPrev: args?.containerPrev ?? null,
			containerNext: args?.containerNext ?? null,
		};

		const nav = document.createElement( 'div' );
		nav.classList.add( options.classNames.navContainer );

		const prev = document.createElement( 'button' );
		prev.setAttribute( 'class', options.classNames.prevButton );
		prev.setAttribute( 'type', 'button' );
		prev.setAttribute( 'aria-label', options.texts.buttonPrevious );
		prev.setAttribute( 'aria-controls', slider.container.getAttribute( 'id' ) ?? '');
		prev.setAttribute( 'data-type', 'prev' );
		prev.innerHTML = slider.options.rtl ? options.icons.next : options.icons.prev;
		prev.addEventListener( 'click', () => {
			if ( prev.getAttribute('data-has-content') === 'true' ) {
				slider.moveToDirection( 'prev' );
			}
		} );

		const next = document.createElement( 'button' );
		next.setAttribute( 'class', options.classNames.nextButton );
		next.setAttribute( 'type', 'button' );
		next.setAttribute( 'aria-label', options.texts.buttonNext );
		next.setAttribute( 'aria-controls', slider.container.getAttribute( 'id' ) ?? '');
		next.setAttribute( 'data-type', 'next' );
		next.innerHTML = slider.options.rtl ? options.icons.prev : options.icons.next;
		next.addEventListener( 'click', () => {
			if ( next.getAttribute('data-has-content') === 'true' ) {
				slider.moveToDirection( 'next' );
			}
		} );

		// insert buttons to the nav
		nav.appendChild( prev );
		nav.appendChild( next );

		const update = () => {
			const scrollLeft = slider.getScrollLeft();
			const scrollWidth = slider.getInclusiveScrollWidth();
			const clientWidth = slider.getInclusiveClientWidth();
			const buffer      = 1;
			if ( Math.floor( scrollLeft ) === 0 ) {
				prev.setAttribute( 'data-has-content', 'false' );
			} else {
				prev.setAttribute( 'data-has-content', 'true' );
			}
			const maxWidthDifference = Math.abs( Math.floor( scrollLeft + clientWidth ) - Math.floor( scrollWidth ) );
			if ( maxWidthDifference <= buffer ) {
				next.setAttribute( 'data-has-content', 'false' );
			} else {
				next.setAttribute( 'data-has-content', 'true' );
			}
		};

		if ( options.containerNext && options.containerPrev ) {
			options.containerPrev.appendChild( prev );
			options.containerNext.appendChild( next );
		} else {
			if ( options.container ) {
				options.container.appendChild( nav );
			} else {
				slider.container.parentNode?.insertBefore( nav, slider.container.nextSibling );
			}
		}

		update();
		slider.on( 'scrollEnd', update );
		slider.on( 'contentsChanged', update );
		slider.on( 'containerSizeChanged', update );
	};
}
