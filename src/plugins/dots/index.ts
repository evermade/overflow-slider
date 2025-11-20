import { Slider, DeepPartial } from '../../core/types';

export type DotsOptions = {
	type: 'view' | 'slide';
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
			type: args?.type ?? 'slide',
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

			const count = options.type === 'view' ? slider.details.amountOfPages : slider.details.slideCount;
			const currentIndex = options.type === 'view' ? slider.details.currentPage : slider.activeSlideIdx;

			if ( count <= 1 ) {
				return;
			}

			for ( let i = 0; i < count; i++ ) {
				const dotListItem = document.createElement( 'li' );
				const dot = document.createElement( 'button' );
				dot.setAttribute( 'type', 'button' );
				dot.setAttribute( 'class', options.classNames.dotsItem );
				dot.setAttribute( 'aria-label', options.texts.dotDescription.replace( '%d', ( i + 1 ).toString() ).replace( '%d', count.toString() ) );
				dot.setAttribute( 'aria-pressed', ( i === currentIndex ).toString() );
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
						const previousIndex = currentItem - 1;
						if ( previousIndex > 0 ) {
							const matchingDot = dots.querySelector( `[data-item="${previousIndex}"]` );
							if ( matchingDot ) {
								( <HTMLElement>matchingDot ).focus();
							}
							activateDot( previousIndex );
						}
					}
					if ( e.key === 'ArrowRight' ) {
						const nextIndex = currentItem + 1;
						if ( nextIndex <= count ) {
							const matchingDot = dots.querySelector( `[data-item="${nextIndex}"]` );
							if ( matchingDot ) {
								( <HTMLElement>matchingDot ).focus();
							}
							activateDot( nextIndex );
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

		const activateDot = ( index: number ) => {
			if ( options.type === 'view' ) {
				const targetPosition = slider.details.containerWidth * ( index - 1 );
				const scrollLeft = slider.options.rtl ? -targetPosition : targetPosition;
				slider.container.scrollTo({
					left: scrollLeft,
					behavior: slider.options.scrollBehavior as ScrollBehavior
				});
			} else {
				slider.moveToSlide( index - 1 );
			}
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
		slider.on( 'detailsChanged', buildDots );
	};
};
