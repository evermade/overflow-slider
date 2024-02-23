import { Slider } from '../../core/types';

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

export default function DotsPlugin( args: { [key: string]: any } ) {
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

			const pages = slider.details.amountOfPages;
			const currentPage = slider.details.currentPage;

			if ( pages <= 1 ) {
				return;
			}

			for ( let i = 0; i < pages; i++ ) {
				const dotListItem = document.createElement( 'li' );
				const dot = document.createElement( 'button' );
				dot.setAttribute( 'type', 'button' );
				dot.setAttribute( 'class', options.classNames.dotsItem );
				dot.setAttribute( 'aria-label', options.texts.dotDescription.replace( '%d', ( i + 1 ).toString() ).replace( '%d', pages.toString() ) );
				dot.setAttribute( 'aria-pressed', ( i === currentPage ).toString() );
				dot.setAttribute( 'data-page', ( i + 1 ).toString() );
				dotListItem.appendChild( dot );
				dotsList.appendChild( dotListItem );
				dot.addEventListener( 'click', () => activateDot( i + 1 ) );
				dot.addEventListener( 'focus', () => pageFocused = i + 1 );
				dot.addEventListener( 'keydown', ( e ) => {
					const currentPageItem = dots.querySelector( `[aria-pressed="true"]` );
					if ( ! currentPageItem ) {
						return;
					}
					const currentPage = parseInt( currentPageItem.getAttribute( 'data-page' ) ?? '1' );
					if ( e.key === 'ArrowLeft' ) {
						const previousPage = currentPage - 1;
						if ( previousPage > 0 ) {
							const matchingDot = dots.querySelector( `[data-page="${previousPage}"]` );
							if ( matchingDot ) {
								( <HTMLElement>matchingDot ).focus();
							}
							activateDot( previousPage );
						}
					}
					if ( e.key === 'ArrowRight' ) {
						const nextPage = currentPage + 1;
						if ( nextPage <= pages ) {
							const matchingDot = dots.querySelector( `[data-page="${nextPage}"]` );
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
				const matchingDot = dots.querySelector( `[data-page="${pageFocused}"]` );
				if ( matchingDot ) {
					( <HTMLElement>matchingDot ).focus();
				}
			}
		};

		const activateDot = ( page: number ) => {
			const scrollTargetPosition = slider.details.containerWidth * ( page - 1 );
			slider.container.style.scrollBehavior = slider.options.scrollBehavior;
			slider.container.style.scrollSnapType = 'none';
			slider.container.scrollLeft = scrollTargetPosition;
			slider.container.style.scrollBehavior = '';
			slider.container.style.scrollSnapType = '';
		};

		buildDots();

		if ( options.container ) {
			options.container.appendChild( dots );
		} else {
			slider.container.parentNode?.insertBefore( dots, slider.container.nextSibling );
		}

		slider.on( 'detailsChanged', () => {
			buildDots();
		} );

	};
};
