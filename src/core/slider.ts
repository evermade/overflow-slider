import { Slider, SliderOptions, SliderPlugin } from './types';
import details from './details';
import { generateId, objectsAreEqual } from './utils';

export default function Slider( container: HTMLElement, options : SliderOptions, plugins? : SliderPlugin[] ) {
	let slider: Slider;
	let subs: { [key: string]: any[] } = {};

	function init() {
		slider.container = container;
		// ensure container has id
		let containerId = container.getAttribute( 'id' );
		if ( containerId === null ) {
			containerId = generateId( 'overflow-slider' );
			container.setAttribute( 'id', containerId );
		}
		setDetails(true);
		slider.on('contentsChanged', () => setDetails());
		slider.on('containerSizeChanged', () => setDetails());

		let requestId = 0;
		const setDetailsDebounce = () => {
			if ( requestId ) {
				window.cancelAnimationFrame( requestId );
			}
			requestId = window.requestAnimationFrame(() => {
				setDetails();
			});
		};
		slider.on('scroll', setDetailsDebounce);

		addEventListeners();
		setDataAttributes();
		setCSSVariables();
		if (plugins) {
			for (const plugin of plugins) {
				plugin(slider);
			}
		}
		slider.on('detailsChanged', () => {
			setDataAttributes();
			setCSSVariables();
		});
		slider.emit('created');
	};

	function setDetails( isInit = false ) {
		const oldDetails = slider.details;
		const newDetails = details( slider );
		slider.details = newDetails;
		if ( !isInit && !objectsAreEqual( oldDetails, newDetails ) ) {
			slider.emit('detailsChanged');
		} else if ( isInit ) {
			slider.emit('detailsChanged');
		}
	};

	function addEventListeners() {

		// changes to DOM
		const observer = new MutationObserver( () => slider.emit('contentsChanged') );
		observer.observe( slider.container, { childList: true } );

		// container size changes
		const resizeObserver = new ResizeObserver( () => slider.emit('containerSizeChanged') );
		resizeObserver.observe( slider.container );

		// scroll event with debouncing
		slider.container.addEventListener('scroll', () => slider.emit('scroll'));

		// Listen for mouse down and touch start events on the document
		// This handles both mouse clicks and touch interactions
		let wasInteractedWith = false;
		slider.container.addEventListener('mousedown', () => {
			wasInteractedWith = true;
		});
		slider.container.addEventListener('touchstart', () => {
			wasInteractedWith = true;
		}, { passive: true });
		slider.container.addEventListener('focusin', (e) => {
			// move target parents as long as they are not the container
			// but only if focus didn't start from mouse or touch
			if (!wasInteractedWith) {
				let target = e.target as HTMLElement;
				while (target.parentElement !== slider.container) {
					if (target.parentElement) {
						target = target.parentElement;
					} else {
						break;
					}
				}
				ensureSlideIsInView(target);
			}
			wasInteractedWith = false;
		});


	};

	function setCSSVariables() {
		slider.container.style.setProperty('--slider-container-width', `${slider.details.containerWidth}px`);
		slider.container.style.setProperty('--slider-scrollable-width', `${slider.details.scrollableAreaWidth}px`);
		slider.container.style.setProperty('--slider-slides-count', `${slider.details.slideCount}`);
	}

	function setDataAttributes() {
		slider.container.setAttribute('data-has-overflow', slider.details.hasOverflow ? 'true' : 'false');
	}

	function ensureSlideIsInView( slide: HTMLElement ) {
		const slideRect = slide.getBoundingClientRect();
		const sliderRect = slider.container.getBoundingClientRect();
		const containerWidth = slider.container.offsetWidth;
		const scrollLeft = slider.container.scrollLeft;
		const slideStart = slideRect.left - sliderRect.left + scrollLeft;
		const slideEnd = slideStart + slideRect.width;
		let scrollTarget = null;
		if (slideStart < scrollLeft) {
			scrollTarget = slideStart;
		} else if (slideEnd > scrollLeft + containerWidth) {
			scrollTarget = slideEnd - containerWidth;
		}
		if (scrollTarget) {
			slider.container.style.scrollSnapType = 'none';
			slider.container.scrollLeft = scrollTarget;
			// @todo resume scroll snapping but at least proximity gives a lot of trouble
			// and it's not really needed for this use case but it would be nice to have
			// it back in case it's needed. We need to calculate scrollLeft some other way
		}
	};

	function moveToDirection(direction = "prev") {
		const scrollStrategy = slider.options.scrollStrategy;
		const scrollLeft = slider.container.scrollLeft;
		const sliderRect = slider.container.getBoundingClientRect();
		const containerWidth = slider.container.offsetWidth;
		let targetScrollPosition = scrollLeft;
		if (direction === 'prev') {
			targetScrollPosition = Math.max(0, scrollLeft - slider.container.offsetWidth);
		} else if (direction === 'next') {
			targetScrollPosition = Math.min(slider.container.scrollWidth, scrollLeft + slider.container.offsetWidth);
		}
		if (scrollStrategy === 'fullSlide') {
			let fullSldeTargetScrollPosition = null;
			const slides = Array.from(slider.container.querySelectorAll(':scope > *'));

			let gapSize = 0;

			if (slides.length > 1) {
				const firstSlideRect = slides[0].getBoundingClientRect();
				const secondSlideRect = slides[1].getBoundingClientRect();
				gapSize = secondSlideRect.left - firstSlideRect.right;
			}

			// extend targetScrollPosition to include gap
			if (direction === 'prev') {
				fullSldeTargetScrollPosition = Math.max(0, targetScrollPosition - gapSize);
			} else {
				fullSldeTargetScrollPosition = Math.min(slider.container.scrollWidth, targetScrollPosition + gapSize);
			}

			if (direction === 'next') {
				let partialSlideFound = false;
				for (let slide of slides) {
					const slideRect = slide.getBoundingClientRect();
					const slideStart = slideRect.left - sliderRect.left + scrollLeft;
					const slideEnd = slideStart + slideRect.width;
					if (slideStart < targetScrollPosition && slideEnd > targetScrollPosition) {
						fullSldeTargetScrollPosition = slideStart;
						partialSlideFound = true;
						break;
					}
				}
				if (!partialSlideFound) {
					fullSldeTargetScrollPosition = Math.min(targetScrollPosition, slider.container.scrollWidth - slider.container.offsetWidth);
				}
				if (fullSldeTargetScrollPosition && fullSldeTargetScrollPosition > scrollLeft) {
					targetScrollPosition = fullSldeTargetScrollPosition;
				}
			} else {
				let partialSlideFound = false;
				for (let slide of slides) {
					const slideRect = slide.getBoundingClientRect();
					const slideStart = slideRect.left - sliderRect.left + scrollLeft;
					const slideEnd = slideStart + slideRect.width;
					if (slideStart < scrollLeft && slideEnd > scrollLeft) {
						fullSldeTargetScrollPosition = slideEnd - containerWidth;
						partialSlideFound = true;
						break;
					}
				}
				if (!partialSlideFound) {
					fullSldeTargetScrollPosition = Math.max(0, scrollLeft - containerWidth);
				}
				if (fullSldeTargetScrollPosition && fullSldeTargetScrollPosition < scrollLeft) {
					targetScrollPosition = fullSldeTargetScrollPosition;
				}
			}
		}
		slider.container.style.scrollBehavior = slider.options.scrollBehavior;
		slider.container.scrollLeft = targetScrollPosition;
		setTimeout(() => slider.container.style.scrollBehavior = '', 50);
	}

	function on(name: string, cb: any) {
		if (!subs[name]) {
			subs[name] = [];
		}
		subs[name].push(cb);
	}

	function emit(name: string) {
		if (subs && subs[name]) {
			subs[name].forEach(cb => {
					cb(slider);
			});
		}
		const optionCallBack = slider?.options?.[name];
		if (typeof optionCallBack === 'function') {
				optionCallBack(slider);
		}
	}

	slider = <Slider>{
		emit,
		moveToDirection,
		on,
		options,
	};

	init();

	return slider;
}
