import { Slider } from '../../core/types';

const DEFAULT_DRAGGED_DISTANCE_THAT_PREVENTS_CLICK = 20;

export type DragScrollingOptions = {
	draggedDistanceThatPreventsClick: number,
};

export default function DragScrollingPlugin( args: { [key: string]: any } ) {
	const options = <DragScrollingOptions>{
		draggedDistanceThatPreventsClick: args?.draggedDistanceThatPreventsClick ?? DEFAULT_DRAGGED_DISTANCE_THAT_PREVENTS_CLICK,
	};
	return ( slider: Slider ) => {
		let isMouseDown = false;
		let startX = 0;
		let scrollLeft = 0;

		let isMovingForward = false;
		let programmaticScrollStarted = false;
		let mayNeedToSnap = false;

		// add data attribute to container
		slider.container.setAttribute( 'data-has-drag-scrolling', 'true' );

		const mouseDown = (e: MouseEvent) => {
			programmaticScrollStarted = false;
			if ( ! slider.details.hasOverflow ) {
				return;
			}
			if ( ! slider.container.contains( e.target as Node ) ) {
				return;
			}
			isMouseDown = true;
			startX = e.pageX - slider.container.offsetLeft;
			scrollLeft = slider.container.scrollLeft;
			// change cursor to grabbing
			slider.container.style.cursor = 'grabbing';
			slider.container.style.scrollBehavior = 'auto';
			// prevent focus going to the slides
			e.preventDefault();
			e.stopPropagation();
		};

		const mouseMove = (e: MouseEvent) => {
			if ( ! slider.details.hasOverflow ) {
				programmaticScrollStarted = false;
				return;
			}
			if (!isMouseDown) {
				programmaticScrollStarted = false;
				return;
			}
			e.preventDefault();
			if (!programmaticScrollStarted) {
				programmaticScrollStarted = true;
				slider.emit('programmaticScrollStart');
			}
			const x = e.pageX - slider.container.offsetLeft;
			const walk = (x - startX);
			const newScrollLeft = scrollLeft - walk;
			mayNeedToSnap = true;
			if ( Math.floor( slider.container.scrollLeft ) !== Math.floor( newScrollLeft ) ) {
				isMovingForward = slider.container.scrollLeft < newScrollLeft;
			}
			slider.container.scrollLeft = newScrollLeft;

			const absWalk = Math.abs(walk);
			const slides = slider.container.querySelectorAll( slider.options.slidesSelector );
			const pointerEvents = absWalk > options.draggedDistanceThatPreventsClick ? 'none' : '';
			slides.forEach((slide) => {
				(<HTMLElement>slide).style.pointerEvents = pointerEvents;
			});
		};

		const mouseUp = () => {
			if (!slider.details.hasOverflow) {
				programmaticScrollStarted = false;
				return;
			}
			isMouseDown = false;

			slider.container.style.cursor = '';
			setTimeout(() => {
				programmaticScrollStarted = false;
				slider.container.style.scrollBehavior = '';
				const slides = slider.container.querySelectorAll( slider.options.slidesSelector );
				slides.forEach((slide) => {
					(<HTMLElement>slide).style.pointerEvents = '';
				});
			}, 50);
		};

		window.addEventListener('mousedown', mouseDown);
		window.addEventListener('mousemove', mouseMove);
		window.addEventListener('mouseup', mouseUp);

		// emulate scroll snapping
		if ( slider.options.emulateScrollSnap ) {
			const snap = () => {
				if (!mayNeedToSnap || isMouseDown) {
					return;
				}
				mayNeedToSnap = false;
				slider.snapToClosestSlide(isMovingForward ? 'next' : 'prev');
			};
			slider.on( 'programmaticScrollEnd', snap );
			window.addEventListener( 'mouseup', snap );
		}

	};
};
