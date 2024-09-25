import { Slider, SliderOptions, SliderPlugin, SliderCallback } from './types';
import details from './details';
import { generateId, objectsAreEqual, getOutermostChildrenEdgeMarginSum } from './utils';

export default function Slider( container: HTMLElement, options : SliderOptions, plugins? : SliderPlugin[] ) {
	let slider: Slider;
	let subs: { [key: string]: SliderCallback[] } = {};

	function init() {
		slider.container = container;
		// ensure container has id
		let containerId = container.getAttribute( 'id' );
		if ( containerId === null ) {
			containerId = generateId( 'overflow-slider' );
			container.setAttribute( 'id', containerId );
		}
		setSlides();
		setDetails(true);
		setActiveSlideIdx();
		slider.on('contentsChanged', () => {
			setSlides();
			setDetails();
			setActiveSlideIdx();
		});
		slider.on('containerSizeChanged', () => setDetails());

		let requestId = 0;
		const setDetailsDebounce = () => {
			if ( requestId ) {
				window.cancelAnimationFrame( requestId );
			}
			requestId = window.requestAnimationFrame(() => {
				setDetails();
				setActiveSlideIdx();
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
		slider.container.setAttribute('data-ready', 'true');
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

	function setSlides() {
		slider.slides = Array.from(slider.container.querySelectorAll(slider.options.slidesSelector));
	}

	function addEventListeners() {

		// changes to DOM
		const observer = new MutationObserver( () => slider.emit('contentsChanged') );
		observer.observe( slider.container, { childList: true } );

		// container size changes
		const resizeObserver = new ResizeObserver( () => slider.emit('containerSizeChanged') );
		resizeObserver.observe( slider.container );

		// scroll event with debouncing
		let scrollTimeout: ReturnType<typeof setTimeout>;
		let nativeScrollTimeout: ReturnType<typeof setTimeout>;
		let programmaticScrollTimeout: ReturnType<typeof setTimeout>;

		let scrollLeft = slider.container.scrollLeft;
		let nativeScrollLeft = slider.container.scrollLeft;
		let programmaticScrollLeft = slider.container.scrollLeft;

		let isScrolling = false;
		let isUserScrolling = false;
		let isProgrammaticScrolling = false;

		// all types of scroll
		slider.container.addEventListener('scroll', () => {
			const newScrollLeft = slider.container.scrollLeft;
			if ( Math.floor( scrollLeft ) !== Math.floor( newScrollLeft ) ) {
				if (!isScrolling) {
					isScrolling = true;
					slider.emit('scrollStart');
				}
				scrollLeft = newScrollLeft;
				clearTimeout(scrollTimeout);
				scrollTimeout = setTimeout(() => {
					isScrolling = false;
					slider.emit('scrollEnd');
				}, 50);
				slider.emit('scroll');
			}
			// keep up nativeScrolling to take into account scroll-snap
			if ( isUserScrolling ) {
				nativeScrollHandler();
			}
		});

		// user initted scroll (touchmove, mouse wheel, etc.)
		const nativeScrollHandler = () => {
			const newScrollLeft = slider.container.scrollLeft;
			if ( Math.floor( nativeScrollLeft ) !== Math.floor( newScrollLeft ) && ! isProgrammaticScrolling ) {
				if (!isUserScrolling) {
					slider.emit('nativeScrollStart');
					isUserScrolling = true;
				}
				slider.emit('nativeScroll');
				nativeScrollLeft = newScrollLeft;
				clearTimeout(nativeScrollTimeout);
				nativeScrollTimeout = setTimeout(() => {
					isUserScrolling = false;
					slider.emit('nativeScrollEnd');
					// update programmaticScrollLeft to match nativeScrollLeft
					// this prevents programmaticScroll triggering with no real change to scrollLeft
					programmaticScrollLeft = nativeScrollLeft;
				}, 50);
			}
		};

		slider.container.addEventListener('touchmove', nativeScrollHandler);
		slider.container.addEventListener('mousewheel', nativeScrollHandler);
		slider.container.addEventListener('wheel', nativeScrollHandler);

		// programmatic scroll (scrollTo, etc.)
		slider.on('programmaticScrollStart', () => {
			isProgrammaticScrolling = true;
		});

		slider.container.addEventListener('scroll', () => {
			const newScrollLeft = slider.container.scrollLeft;
			if ( Math.floor( programmaticScrollLeft ) !== Math.floor( newScrollLeft ) && !isUserScrolling && isProgrammaticScrolling) {
				programmaticScrollLeft = newScrollLeft;
				clearTimeout(programmaticScrollTimeout);
				programmaticScrollTimeout = setTimeout(() => {
					isProgrammaticScrolling = false;
					slider.emit('programmaticScrollEnd');
					// update nativeScrollLeft to match programmaticScrollLeft
					// this prevents nativeScroll triggering with no real change to scrollLeft
					nativeScrollLeft = programmaticScrollLeft;
				}, 50);
				slider.emit('programmaticScroll');
			}
		});

		// Fix issues on scroll snapping not working on programmatic scroll (it's not smooth)
		// by disabling scroll snap if scrolling is programmatic
		slider.on( 'programmaticScrollStart', () => {
			slider.container.style.scrollSnapType = 'none';
		} );

		// restore scroll snap if user scroll starts
		slider.on( 'nativeScrollStart', () => {
			slider.container.style.scrollSnapType = '';
		} );

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
				ensureSlideIsInView(target, 'auto');
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
		if ( slider.options.rtl ) {
			slider.container.setAttribute('dir', 'rtl');
		}
	}

	function ensureSlideIsInView( slide: HTMLElement, scrollBehavior: null|ScrollBehavior = null) {
		const behavior = scrollBehavior || slider.options.scrollBehavior as ScrollBehavior;
		const slideRect = slide.getBoundingClientRect();
		const sliderRect = slider.container.getBoundingClientRect();
		const containerWidth = slider.container.offsetWidth;
		const scrollLeft = slider.container.scrollLeft;
		const slideStart = slideRect.left - sliderRect.left + scrollLeft;
		const slideEnd = slideStart + slideRect.width;
		let scrollTarget = null;
		if ( Math.floor( slideStart ) < Math.floor( scrollLeft ) ) {
			scrollTarget = slideStart;
		} else if ( Math.floor( slideEnd ) > Math.floor( scrollLeft ) + Math.floor( containerWidth ) ) {
			scrollTarget = slideEnd - containerWidth;
		} else if ( Math.floor( slideStart ) === 0) {
			scrollTarget = 0;
		} else {
			scrollTarget = slideStart;
		}
		if (scrollTarget !== null) {
			setTimeout((scrollTarget) => {
				slider.emit('programmaticScrollStart');
				slider.container.scrollTo({ left: scrollTarget, behavior: behavior });
			}, 50, scrollTarget);
		}
	};

	function setActiveSlideIdx() {
		const sliderRect = slider.container.getBoundingClientRect();
		const scrollLeft = slider.getScrollLeft();
		const slides = slider.slides;
		let activeSlideIdx = 0;
		let scrolledPastLastSlide = false;

		if (slider.options.rtl) {
			const scrolledDistance = slider.getInclusiveScrollWidth() - scrollLeft - slider.getInclusiveClientWidth();
			const slidePositions = [];
			for (let i = slides.length - 1; i >= 0; i--) {
				const slideRect = slides[i].getBoundingClientRect();
				const slideEnd = Math.abs(slideRect.left) - Math.abs(sliderRect.left) + scrolledDistance;
				slidePositions.push({
					slide: slides[i],
					slideEnd: slideEnd,
				});
			}
			let closestSlide = null;
			let closestDistance = null;
			for (let i = 0; i < slidePositions.length; i++) {
				const distance = Math.abs(slidePositions[i].slideEnd - scrolledDistance);
				if (closestDistance === null || distance < closestDistance) {
					closestDistance = distance;
					closestSlide = slidePositions[i].slide;
				}
			}
			if (closestSlide) {
				activeSlideIdx = slides.indexOf(closestSlide);
			} else {
				activeSlideIdx = slides.length - 1;
			}
		} else {
			for (let i = 0; i < slides.length; i++) {
				const slideRect = slides[i].getBoundingClientRect();
				const slideStart = slideRect.left - sliderRect.left + scrollLeft + getGapSize();
						if (Math.floor(slideStart) >= Math.floor(scrollLeft)) {
								activeSlideIdx = i;
								break;
						}
				if ( i === slides.length - 1 ) {
					scrolledPastLastSlide = true;
				}
			}
		}


		if ( scrolledPastLastSlide ) {
			activeSlideIdx = slides.length - 1;
		}

		const oldActiveSlideIdx = slider.activeSlideIdx;
		slider.activeSlideIdx = activeSlideIdx;

		// console.log('activeSlideIdx', activeSlideIdx);

		if (oldActiveSlideIdx !== activeSlideIdx) {
			slider.emit('activeSlideChanged');
		}
	}


	function moveToSlide( idx: number ) {
		const slide = slider.slides[idx];
		if (slide) {
			ensureSlideIsInView(slide);
		}
	};

	function getInclusiveScrollWidth() : number {
		return slider.container.scrollWidth + getOutermostChildrenEdgeMarginSum(slider.container);
	};

	function getInclusiveClientWidth() : number {
		return slider.container.clientWidth + getOutermostChildrenEdgeMarginSum(slider.container);
	}

	function getScrollLeft() : number {
		return slider.options.rtl ? Math.abs(slider.container.scrollLeft) : slider.container.scrollLeft;
	};

	function setScrollLeft(value: number) : void {
		slider.container.scrollLeft = slider.options.rtl ? -value : value;
	};

	function getGapSize() : number {
		let gapSize = 0;
		if (slider.slides.length > 1) {
			const firstSlideRect = slider.slides[0].getBoundingClientRect();
			const secondSlideRect = slider.slides[1].getBoundingClientRect();
			gapSize = slider.options.rtl ? Math.abs( Math.floor( secondSlideRect.right - firstSlideRect.left ) ) : Math.floor( secondSlideRect.left - firstSlideRect.right );
		}
		return gapSize;
	};

	function getLeftOffset() : number {
		let offset = 0;
		const fullWidthOffset = slider.container.getAttribute('data-full-width-offset');
		if (fullWidthOffset) {
			offset = parseInt(fullWidthOffset);
		}
		return Math.floor( offset );
	};

	function moveToDirection(direction = "prev") {
		const scrollStrategy = slider.options.scrollStrategy;
		const scrollLeft = slider.container.scrollLeft;
		const sliderRect = slider.container.getBoundingClientRect();
		const containerWidth = slider.container.offsetWidth;
		let targetScrollPosition = scrollLeft;

		const realDirection = slider.options.rtl ? (direction === 'prev' ? 'next' : 'prev') : direction;

		if (realDirection === 'prev') {
			targetScrollPosition = Math.max(0, scrollLeft - slider.container.offsetWidth);
		} else if (realDirection === 'next') {
			targetScrollPosition = Math.min(slider.getInclusiveScrollWidth(), scrollLeft + slider.container.offsetWidth);
		}
		if (scrollStrategy === 'fullSlide') {
			let fullSlideTargetScrollPosition = null;

			// extend targetScrollPosition to include gap
			if (realDirection === 'prev') {
				fullSlideTargetScrollPosition = Math.max(0, targetScrollPosition - getGapSize());
			} else {
				fullSlideTargetScrollPosition = Math.min(slider.getInclusiveScrollWidth(), targetScrollPosition + getGapSize());
			}

			if (realDirection === 'next') {
				let partialSlideFound = false;
				for (let slide of slider.slides) {
					const slideRect = slide.getBoundingClientRect();
					const slideStart = slideRect.left - sliderRect.left + scrollLeft;
					const slideEnd = slideStart + slideRect.width;
					if ( Math.floor( slideStart ) < Math.floor( targetScrollPosition ) && Math.floor( slideEnd ) > Math.floor( targetScrollPosition ) ) {
						fullSlideTargetScrollPosition = slideStart;
						partialSlideFound = true;
						break;
					}
				}
				if ( ! partialSlideFound ) {
					fullSlideTargetScrollPosition = Math.min(targetScrollPosition, slider.getInclusiveScrollWidth() - slider.container.offsetWidth);
				}
				if ( fullSlideTargetScrollPosition ) {
					if ( Math.floor( fullSlideTargetScrollPosition ) > Math.floor( scrollLeft ) ) {
						// make sure fullSlideTargetScrollPosition is possible considering the container width
						const maxScrollPosition = Math.floor( slider.getInclusiveScrollWidth() ) - Math.floor( containerWidth );
						targetScrollPosition = Math.min( fullSlideTargetScrollPosition, maxScrollPosition );
					} else {
						// cannot snap to slide, move one page worth of distance
						targetScrollPosition = Math.min(slider.getInclusiveScrollWidth(), scrollLeft + containerWidth);
					}
				}

			} else {
				let partialSlideFound = false;
				for (let slide of slider.slides) {
					const slideRect = slide.getBoundingClientRect();
					const slideStart = slideRect.left - sliderRect.left + scrollLeft;
					const slideEnd = slideStart + slideRect.width;
					if ( Math.floor( slideStart ) < Math.floor( scrollLeft ) && Math.floor( slideEnd ) > Math.floor( scrollLeft ) ) {
						fullSlideTargetScrollPosition = slideEnd - containerWidth;
						partialSlideFound = true;
						break;
					}
				}
				if ( ! partialSlideFound ) {
					fullSlideTargetScrollPosition = Math.max(0, scrollLeft - containerWidth);
				}
				if ( fullSlideTargetScrollPosition && Math.floor( fullSlideTargetScrollPosition ) < Math.floor( scrollLeft ) ) {
					targetScrollPosition = fullSlideTargetScrollPosition;
				}
			}
		}

		// add left offset
		const offsettedTargetScrollPosition = targetScrollPosition - getLeftOffset();
		if ( Math.floor( offsettedTargetScrollPosition ) >= 0) {
			targetScrollPosition = offsettedTargetScrollPosition;
		}

		slider.emit('programmaticScrollStart');
		slider.container.style.scrollBehavior = slider.options.scrollBehavior;
		slider.container.scrollLeft = targetScrollPosition;
		setTimeout(() => slider.container.style.scrollBehavior = '', 50);
	};

	function snapToClosestSlide(direction = "prev") {
		const isMovingForward = slider.options.rtl ? direction === 'prev' : direction === 'next';
		const slideReference = [];
		for (let i = 0; i < slider.slides.length; i++) {
			const slide = slider.slides[i];
			const slideWidth = slide.offsetWidth;
			const slideStart = slider.options.rtl ? Math.abs( slide.offsetLeft + slideWidth - slider.details.containerWidth ) : slide.offsetLeft;
			const slideEnd = slideStart + slideWidth;
			const slideMiddle = slideStart + slideWidth / 2;
			const trigger = Math.min(slideMiddle, slideStart + slider.options.emulateScrollSnapMaxThreshold);
			slideReference.push({
				start: slideStart,
				middle: slideMiddle,
				end: slideEnd,
				width: slideWidth,
				trigger: trigger,
				slide: slide,
				// debug
				offSetleft: slide.offsetLeft,
				rect: slide.getBoundingClientRect(),
			});
		}
		console.log('slideReference', slideReference);
		let snapTarget = null;
		const scrollPosition = getScrollLeft();
		if (isMovingForward) {
			for (let i = 0; i < slideReference.length; i++) {
				const item = slideReference[i];
				if ( i === 0 && Math.floor( scrollPosition ) <= Math.floor( item.trigger ) ) {
					snapTarget = 0;
					break;
				}
				if ( Math.floor( getScrollLeft() ) <= Math.floor( item.trigger ) ) {
					snapTarget = item.start;
					break;
				}
			}
		} else {
			for (let i = slideReference.length - 1; i >= 0; i--) {
				const item = slideReference[i];
				if ( i === slideReference.length - 1 && Math.floor( scrollPosition ) >= Math.floor( item.trigger ) ) {
					snapTarget = item.start;
					break;
				}
				if ( Math.floor( getScrollLeft() ) >= Math.floor( item.trigger ) ) {
					snapTarget = item.start;
					break;
				}
			}
		}
		if ( snapTarget !== null ) {
			const offsettedSnapTarget = snapTarget - getLeftOffset();
			if ( Math.floor( offsettedSnapTarget ) >= 0 ) {
				snapTarget = offsettedSnapTarget;
			}

			const scrollBehavior = slider.options.scrollBehavior || 'smooth';

			slider.container.scrollTo({
				left: slider.options.rtl ? -snapTarget : snapTarget,
				behavior: scrollBehavior as ScrollBehavior
			});
		}
	};

	function on(name: string, cb: SliderCallback) {
		if (!subs[name]) {
			subs[name] = [];
		}
		subs[name].push(cb);
	};

	function emit(name: string) {
		if (subs && subs[name]) {
			subs[name].forEach(cb => {
				cb(slider);
			});
		}

		const optionCallBack = slider?.options?.[name];
		// Type guard to check if the option callback is a function
		if (typeof optionCallBack === 'function') {
			(optionCallBack as SliderCallback)(slider); // Type assertion here
		}
	};

	slider = <Slider>{
		emit,
		moveToDirection,
		moveToSlide,
		snapToClosestSlide,
		getInclusiveScrollWidth,
		getInclusiveClientWidth,
		getScrollLeft,
		setScrollLeft,
		on,
		options,
	};

	init();

	return slider;
}
