import { Slider } from '../core/types';

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
};

export default function ArrowsPlugin( args: { [key: string]: any } ) {
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
		};

		const nav = document.createElement( 'div' );
		nav.classList.add( options.classNames.navContainer );

		const prev = document.createElement( 'button' );
		prev.setAttribute( 'class', options.classNames.prevButton );
		prev.setAttribute( 'type', 'button' );
		prev.setAttribute( 'aria-label', options.texts.buttonPrevious );
		prev.setAttribute( 'aria-controls', slider.container.getAttribute( 'id' ) ?? '');
		prev.setAttribute( 'data-type', 'prev' );
		prev.innerHTML = options.icons.prev;
		prev.addEventListener( 'click', () => slider.moveToDirection( 'prev' ) );

		const next = document.createElement( 'button' );
		next.setAttribute( 'class', options.classNames.nextButton );
		next.setAttribute( 'type', 'button' );
		next.setAttribute( 'aria-label', options.texts.buttonNext );
		next.setAttribute( 'aria-controls', slider.container.getAttribute( 'id' ) ?? '');
		next.setAttribute( 'data-type', 'next' );
		next.innerHTML = options.icons.next;
		next.addEventListener( 'click', () => slider.moveToDirection( 'next' ) );

		// insert buttons to the nav
		nav.appendChild( prev );
		nav.appendChild( next );

		const update = () => {
			const scrollLeft = slider.container.scrollLeft;
			const scrollWidth = slider.container.scrollWidth;
			const clientWidth = slider.container.clientWidth;
			if ( scrollLeft === 0 ) {
				prev.setAttribute( 'data-has-content', 'false' );
			} else {
				prev.setAttribute( 'data-has-content', 'true' );
			}
			if ( scrollLeft + clientWidth >= scrollWidth ) {
				next.setAttribute( 'data-has-content', 'false' );
			} else {
				next.setAttribute( 'data-has-content', 'true' );
			}
		};

		if ( options.container ) {
			options.container.appendChild( nav );
		} else {
			slider.container.parentNode?.insertBefore( nav, slider.container.nextSibling );
		}

		update();
		slider.on( 'scroll', update );
		slider.on( 'contentsChanged', update );
		slider.on( 'containerSizeChanged', update );
	};
}
