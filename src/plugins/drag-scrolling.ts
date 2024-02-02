import { Slider } from '../core/types';

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

		const hasOverflow = () => {
			return slider.details.hasOverflow;
		}

		slider.container.addEventListener('mousedown', (e) => {
			if ( ! hasOverflow() ) {
				return;
			}
			isMouseDown = true;
			startX = e.pageX - slider.container.offsetLeft;
			scrollLeft = slider.container.scrollLeft;
			// change cursor to grabbing
			slider.container.style.cursor = 'grabbing';
			slider.container.style.scrollSnapType = 'none';
			// prevent pointer events on the slides
			// const slides = slider.container.querySelectorAll( ':scope > *' );
			// slides.forEach((slide) => {
			// 	(<HTMLElement>slide).style.pointerEvents = 'none';
			// });
			// prevent focus going to the slides
			// e.preventDefault();
			// e.stopPropagation();
		});
		window.addEventListener('mouseup', () => {
			if ( ! hasOverflow() ) {
				return;
			}
			isMouseDown = false;
			slider.container.style.cursor = '';
			slider.container.style.scrollSnapType = '';
			setTimeout(() => {
				const slides = slider.container.querySelectorAll( ':scope > *' );
				slides.forEach((slide) => {
					(<HTMLElement>slide).style.pointerEvents = '';
				});
			}, 50);
		});
		window.addEventListener('mousemove', (e) => {
			if ( ! hasOverflow() ) {
				return;
			}
			if (!isMouseDown) {
				return;
			}
			e.preventDefault();
			const x = e.pageX - slider.container.offsetLeft;
			const walk = (x - startX);
			slider.container.scrollLeft = scrollLeft - walk;

			// if walk is more than 30px, don't allow click event
			// e.preventDefault();

			const absWalk = Math.abs(walk);
			const slides = slider.container.querySelectorAll( ':scope > *' );
			const pointerEvents = absWalk > options.draggedDistanceThatPreventsClick ? 'none' : '';
			slides.forEach((slide) => {
				(<HTMLElement>slide).style.pointerEvents = pointerEvents;
			});
		});
	};
};
