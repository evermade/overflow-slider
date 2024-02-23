import { Slider } from '../../core/types';

const DEFAULT_CLASS_NAMES = {
	scrollIndicator: 'overflow-slider__scroll-indicator',
	scrollIndicatorBar: 'overflow-slider__scroll-indicator-bar',
	scrollIndicatorButton: 'overflow-slider__scroll-indicator-button',
};

export type ScrollIndicatorOptions = {
	classNames: {
		scrollIndicator: string;
		scrollIndicatorBar: string;
		scrollIndicatorButton: string;
	},
	container: HTMLElement | null,
};

export default function ScrollIndicatorPlugin( args: { [key: string]: any } ) {
	return ( slider: Slider ) => {

		const options = <ScrollIndicatorOptions>{
			classNames: {
				...DEFAULT_CLASS_NAMES,
				...args?.classNames || []
			},
			container: args?.container ?? null,
		};


		const scrollbarContainer = document.createElement( 'div' );
		scrollbarContainer.setAttribute( 'class', options.classNames.scrollIndicator );
		scrollbarContainer.setAttribute( 'tabindex', '0' );
		scrollbarContainer.setAttribute( 'role', 'scrollbar' );
		scrollbarContainer.setAttribute( 'aria-controls', slider.container.getAttribute( 'id' ) ?? '' );
		scrollbarContainer.setAttribute( 'aria-orientation', 'horizontal' );
		scrollbarContainer.setAttribute( 'aria-valuemax', '100' );
		scrollbarContainer.setAttribute( 'aria-valuemin', '0' );
		scrollbarContainer.setAttribute( 'aria-valuenow', '0' );

		const scrollbar = document.createElement( 'div' );
		scrollbar.setAttribute( 'class', options.classNames.scrollIndicatorBar );

		const scrollbarButton = document.createElement( 'div' );
		scrollbarButton.setAttribute( 'class', options.classNames.scrollIndicatorButton );
		scrollbarButton.setAttribute( 'data-is-grabbed', 'false' );

		scrollbar.appendChild( scrollbarButton );
		scrollbarContainer.appendChild( scrollbar );

		const setDataAttributes = () => {
			scrollbarContainer.setAttribute( 'data-has-overflow', slider.details.hasOverflow.toString() );
		}
		setDataAttributes();

		const getScrollbarButtonLeftOffset = () => {
			const  contentRatio = scrollbarButton.offsetWidth / slider.details.containerWidth;
			return slider.container.scrollLeft * contentRatio;
		};

		// scrollbarbutton width and position is calculated based on the scroll position and available width
		let requestId = 0;
		const update = () => {
			if ( requestId ) {
				window.cancelAnimationFrame( requestId );
			}

			requestId = window.requestAnimationFrame(() => {
				const scrollbarButtonWidth = (slider.details.containerWidth / slider.details.scrollableAreaWidth) * 100;

				const scrollLeftInPortion = getScrollbarButtonLeftOffset();
				scrollbarButton.style.width = `${scrollbarButtonWidth}%`;
				scrollbarButton.style.transform = `translateX(${scrollLeftInPortion}px)`;

				// aria-valuenow
				const scrollLeft = slider.container.scrollLeft;
				const scrollWidth = slider.container.scrollWidth;
				const containerWidth = slider.container.offsetWidth;
				const scrollPercentage = (scrollLeft / (scrollWidth - containerWidth)) * 100;
				scrollbarContainer.setAttribute( 'aria-valuenow', Math.round(Number.isNaN(scrollPercentage) ? 0 : scrollPercentage).toString() );
			});
		};

		// insert to DOM
		if ( options.container ) {
			options.container.appendChild( scrollbarContainer );
		} else {
			slider.container.parentNode?.insertBefore( scrollbarContainer, slider.container.nextSibling );
		}

		// update the scrollbar when the slider is scrolled
		update();
		slider.on( 'scroll', update );
		slider.on( 'contentsChanged', update );
		slider.on( 'containerSizeChanged', update );
		slider.on( 'detailsChanged', setDataAttributes );

		// handle arrow keys while focused
		scrollbarContainer.addEventListener( 'keydown', (e) => {
			if ( e.key === 'ArrowLeft' ) {
				slider.moveToDirection( 'prev' );
			} else if ( e.key === 'ArrowRight' ) {
				slider.moveToDirection( 'next' );
			}
		});

		// handle click to before or after the scrollbar button
		scrollbarContainer.addEventListener( 'click', (e) => {
			const scrollbarButtonWidth = scrollbarButton.offsetWidth;
			const scrollbarButtonLeft = getScrollbarButtonLeftOffset();
			const scrollbarButtonRight = scrollbarButtonLeft + scrollbarButtonWidth;
			const clickX = e.pageX - scrollbarContainer.offsetLeft;
			if ( clickX < scrollbarButtonLeft ) {
				slider.moveToDirection( 'prev' );
			} else if ( clickX > scrollbarButtonRight ) {
				slider.moveToDirection( 'next' );
			}
		});

		// make scrollbar button draggable via mouse/touch and update the scroll position
		let isInteractionDown = false;
		let startX = 0;
		let scrollLeft = 0;

		const onInteractionDown = (e: MouseEvent | TouchEvent) => {
			isInteractionDown = true;
			const pageX = (e as MouseEvent).pageX || (e as TouchEvent).touches[0].pageX;
			startX = pageX - scrollbarContainer.offsetLeft;
			scrollLeft = slider.container.scrollLeft;
			// change cursor to grabbing
			scrollbarButton.style.cursor = 'grabbing';
			slider.container.style.scrollSnapType = 'none';
			scrollbarButton.setAttribute( 'data-is-grabbed', 'true' );

			e.preventDefault();
			e.stopPropagation();
		};

		const onInteractionMove = (e: MouseEvent | TouchEvent) => {
			if (!isInteractionDown) {
				return;
			}
			e.preventDefault();
			const pageX = (e as MouseEvent).pageX || (e as TouchEvent).touches[0].pageX;
			const x = pageX - scrollbarContainer.offsetLeft;
			const scrollingFactor = slider.details.scrollableAreaWidth / scrollbarContainer.offsetWidth;

			const walk = (x - startX) * scrollingFactor;
			slider.container.scrollLeft = scrollLeft + walk;
		};

		const onInteractionUp = () => {
			isInteractionDown = false;
			scrollbarButton.style.cursor = '';
			slider.container.style.scrollSnapType = '';
			scrollbarButton.setAttribute( 'data-is-grabbed', 'false' );
		};

		scrollbarButton.addEventListener('mousedown', onInteractionDown);
		scrollbarButton.addEventListener('touchstart', onInteractionDown);

		window.addEventListener('mousemove', onInteractionMove);
		window.addEventListener('touchmove', onInteractionMove, { passive: false });

		window.addEventListener('mouseup', onInteractionUp);
		window.addEventListener('touchend', onInteractionUp);

	};
}
