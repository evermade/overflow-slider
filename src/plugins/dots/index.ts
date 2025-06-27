import { Slider, DeepPartial } from '../../core/types';

export type DotsOptions = {
	texts: {
		dotDescription: string;
	},
	classNames: {
		dotsContainer: string;
		dotsItem: string;
	},
	container: HTMLElement | null,
};

const DEFAULT_TEXTS = {
	dotDescription: 'Page %d of %d',
};

const DEFAULT_CLASS_NAMES = {
	dotsContainer: 'overflow-slider__dots',
	dotsItem: 'overflow-slider__dot-item',
};

export default function DotsPlugin( args?: DeepPartial<DotsOptions> ) {
	return ( slider: Slider ) => {
		const options = <DotsOptions>{
			texts: {
				...DEFAULT_TEXTS,
				...args?.texts || []
			},
			classNames: {
				...DEFAULT_CLASS_NAMES,
				...args?.classNames || []
			},
			container: args?.container ?? null,
		};

		const dots = document.createElement( 'div' );
		dots.classList.add( options.classNames.dotsContainer );

		let pageFocused: number|null = null;

		const buildDots = () => {
			dots.setAttribute( 'data-has-content', slider.details.hasOverflow.toString() );
			dots.innerHTML = '';

			const dotsList = document.createElement( 'ul' );

			const pages = slider.details.slideCount;
			const currentItem = slider.activeSlideIdx;

			if ( pages <= 1 ) {
				return;
			}

			for ( let i = 0; i < pages; i++ ) {
				const dotListItem = document.createElement( 'li' );
				const dot = document.createElement( 'button' );
				dot.setAttribute( 'type', 'button' );
				dot.setAttribute( 'class', options.classNames.dotsItem );
				dot.setAttribute( 'aria-label', options.texts.dotDescription.replace( '%d', ( i + 1 ).toString() ).replace( '%d', pages.toString() ) );
				dot.setAttribute( 'aria-pressed', ( i === currentItem ).toString() );
				dot.setAttribute( 'data-item', ( i + 1 ).toString() );
				dotListItem.appendChild( dot );
				dotsList.appendChild( dotListItem );
				dot.addEventListener( 'click', () => activateDot( i + 1 ) );
				dot.addEventListener( 'focus', () => pageFocused = i + 1 );
				dot.addEventListener( 'keydown', ( e ) => {
					const currentItemItem = dots.querySelector( `[aria-pressed="true"]` );
					if ( ! currentItemItem ) {
						return;
					}
					const currentItem = parseInt( currentItemItem.getAttribute( 'data-item' ) ?? '1' );
					if ( e.key === 'ArrowLeft' ) {
						const previousPage = currentItem - 1;
						if ( previousPage > 0 ) {
							const matchingDot = dots.querySelector( `[data-item="${previousPage}"]` );
							if ( matchingDot ) {
								( <HTMLElement>matchingDot ).focus();
							}
							activateDot( previousPage );
						}
					}
					if ( e.key === 'ArrowRight' ) {
						const nextPage = currentItem + 1;
						if ( nextPage <= pages ) {
							const matchingDot = dots.querySelector( `[data-item="${nextPage}"]` );
							if ( matchingDot ) {
								( <HTMLElement>matchingDot ).focus();
							}
							activateDot( nextPage );
						}
					}
				} );
			}

			dots.appendChild( dotsList );

			// return focus to same page after rebuild
			if ( pageFocused ) {
				const matchingDot = dots.querySelector( `[data-item="${pageFocused}"]` );
				if ( matchingDot ) {
					( <HTMLElement>matchingDot ).focus();
				}
			}
		};

		const activateDot = ( item: number ) => {
			slider.moveToSlide( item - 1 );
		};

		buildDots();

		if ( options.container ) {
			options.container.appendChild( dots );
		} else {
			slider.container.parentNode?.insertBefore( dots, slider.container.nextSibling );
		}

		slider.on( 'scrollEnd', buildDots );
		slider.on( 'contentsChanged', buildDots );
		slider.on( 'containerSizeChanged', buildDots );
	};
};
