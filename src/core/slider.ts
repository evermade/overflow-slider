import { Slider, SliderOptions, SliderOptionArgs, SliderPlugin, SliderCallback } from './types';
import details from './details';
import { generateId, objectsAreEqual, getOutermostChildrenEdgeMarginSum } from './utils';

export default function Slider( container: HTMLElement, options : SliderOptionArgs, plugins? : SliderPlugin[] ) {
	let slider: Slider;
	let subs: { [key: string]: SliderCallback[] } = {};
	// Tracks the slide index requested via moveToSlide()/moveToSlideInDirection() that hasn't
	// been reflected in slider.activeSlideIdx yet (scrolling and its detection are async).
	// Without this, rapid consecutive calls would all read the same stale activeSlideIdx
	// and target the same slide instead of advancing one slide at a time.
	let pendingSlideIdx: number | null = null;

	const overrideTransitions = () => {
		slider.slides.forEach( ( slide ) => {
			slide.style.transition = 'none';
		});
	};

	const restoreTransitions = () => {
		slider.slides.forEach( ( slide ) => {
			slide.style.removeProperty('transition');
		});
	};

	function init() {
		slider.container = container;
		// ensure container has id
		let containerId = container.getAttribute( 'id' );
		if ( containerId === null ) {
			containerId = generateId( 'overflow-slider' );
			container.setAttribute( 'id', containerId );
		}
		setSlides();
		// CSS transitions can cause delays for calculations
		overrideTransitions();
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

		// Discard any pending moveToSlide()/moveToSlideInDirection() target once the user
		// manually scrolls (drag, wheel, touch): our optimistic target no longer applies,
		// so let it resync from the real activeSlideIdx. We deliberately do NOT clear this
		// based on our own programmatic scroll settling (e.g. 'scrollEnd'), since that fires
		// on a fixed debounce that can race with the tail end of a slow-easing smooth scroll
		// animation, causing a click to appear to do nothing until a second click is made.
		slider.on('nativeScrollStart', () => {
			pendingSlideIdx = null;
		});

		addEventListeners();
		setDataAttributes();
		setCSSVariables();

		if (plugins) {
			for (const plugin of plugins) {
				plugin(slider);
			}
			// plugins may mutate layout: refresh details and derived data after they run
			// setTimeout( () => {
				setDetails();
				setActiveSlideIdx();
				setCSSVariables();
				slider.emit('pluginsLoaded');
			// }, 250 );
		}
		slider.on('detailsChanged', () => {
			setDataAttributes();
			setCSSVariables();
		});
		slider.emit('created');
		restoreTransitions();
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
		slider.slides = Array.from(slider.container.querySelectorAll(slider.options.slidesSelector)) as HTMLElement[];
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
			// A manual interaction (e.g. DragScrollingPlugin) is starting: any pending
			// moveToSlide()/moveToSlideInDirection() target is no longer relevant, even
			// though such drags emit 'programmaticScrollStart' rather than a native one.
			pendingSlideIdx = null;
		});
		slider.container.addEventListener('touchstart', () => {
			wasInteractedWith = true;
			pendingSlideIdx = null;
		}, { passive: true });
		slider.container.addEventListener('focusin', (e) => {
			// Only handle keyboard-initiated focus (not mouse or touch)
			if (wasInteractedWith) {
				wasInteractedWith = false;
				return;
			}
			wasInteractedWith = false;

			// No scrolling needed if there is no overflow
			if ( !slider.details.hasOverflow ) {
				return;
			}

			const focusedElement = e.target as HTMLElement;

			// Walk up from the focused element to find the direct child (slide) of the container
			let slide = focusedElement;
			while (slide.parentElement !== slider.container) {
				if (slide.parentElement) {
					slide = slide.parentElement;
				} else {
					// Focused element is not inside the slider container
					return;
				}
			}

			// Emit programmaticScrollStart immediately so the browser's native focus
			// scroll events are classified as programmatic (not native). This prevents
			// nativeScrollStart from restoring scrollSnapType and fighting our correction.
			slider.emit('programmaticScrollStart');

			// Use setTimeout to let the browser's native focus scroll complete,
			// then override with our WCAG-compliant scroll positioning
			setTimeout(() => {
				scrollFocusedSlideIntoView(slide, focusedElement);
				slider.emit('focusScroll');
			}, 50);
		});


	};

	function setCSSVariables() {
		slider.options.cssVariableContainer.style.setProperty('--slider-container-height', `${slider.details.containerHeight}px`);
		slider.options.cssVariableContainer.style.setProperty('--slider-container-width', `${slider.details.containerWidth}px`);
		slider.options.cssVariableContainer.style.setProperty('--slider-scrollable-width', `${slider.details.scrollableAreaWidth}px`);
		slider.options.cssVariableContainer.style.setProperty('--slider-slides-count', `${slider.details.slideCount}`);
		slider.options.cssVariableContainer.style.setProperty('--slider-x-offset', `${getLeftOffset()}px`);
		if (typeof slider.options.targetWidth  === 'function') {
	 		slider.options.cssVariableContainer.style.setProperty('--slider-container-target-width', `${slider.options.targetWidth(slider)}px`);
		}
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
		// FullWidthPlugin adds inline margin (only) to the first/last slide, which
		// reserves space at the start/end of the container. That margin has to be
		// compensated for here, otherwise the scroll target under/overshoots by
		// that amount and moving a single slide at a time breaks.
		const leftOffset = getLeftOffset();
		let scrollTarget = null;
		if ( Math.floor( slideStart ) < Math.floor( scrollLeft ) ) {
			scrollTarget = Math.max( 0, slideStart - leftOffset );
		} else if ( Math.floor( slideEnd ) > Math.floor( scrollLeft ) + Math.floor( containerWidth ) ) {
			scrollTarget = slideEnd - containerWidth + leftOffset;
		} else if ( Math.floor( slideStart ) === 0) {
			scrollTarget = 0;
		} else {
			scrollTarget = Math.max( 0, slideStart - leftOffset );
		}
		// Clamp to the real scrollable range, and snap exactly to it when targeting the
		// last slide. Without this, the leftOffset-compensated target can overshoot past
		// what the browser actually allows, silently getting clamped to a slightly
		// different position than our formula assumed - which then throws off the
		// calculation for the next move (e.g. going back to the second-to-last slide).
		const maxScrollLeft = Math.max( 0, slider.getInclusiveScrollWidth() - containerWidth );
		const isLastSlide = slider.slides.length > 0 && slide === slider.slides[slider.slides.length - 1];
		if ( isLastSlide ) {
			scrollTarget = maxScrollLeft;
		} else if ( scrollTarget !== null ) {
			scrollTarget = Math.min( scrollTarget, maxScrollLeft );
		}
		if (scrollTarget !== null) {
			setTimeout((scrollTarget) => {
				slider.emit('programmaticScrollStart');
				slider.container.scrollTo({ left: scrollTarget, behavior: behavior });
			}, 50, scrollTarget);
		}
	};

	/**
	 * Scrolls a focused slide (or child element) into view for WCAG AA compliance.
	 * Priority:
	 *   1. Show the full slide if it fits in the container
	 *   2. If the slide is wider than the container, show the focused element
	 *   3. If neither fits, align the leading edge (left for LTR, right for RTL)
	 */
	function scrollFocusedSlideIntoView( slide: HTMLElement, focusedElement: HTMLElement ) {
		const isRtl = slider.options.rtl;
		const containerRect = slider.container.getBoundingClientRect();
		const containerWidth = slider.container.offsetWidth;
		const slideRect = slide.getBoundingClientRect();
		const scrollLeft = slider.container.scrollLeft;

		// Calculate visual offsets relative to the container viewport
		const slideLeftOffset = slideRect.left - containerRect.left;
		const slideRightOffset = slideRect.right - containerRect.right;

		// Check if slide is already fully visible (1px tolerance for sub-pixel rounding)
		if ( slideLeftOffset >= -1 && slideRightOffset <= 1 ) {
			slider.container.style.scrollSnapType = '';
			slider.emit('programmaticScrollEnd');
			return;
		}

		let scrollTarget: number;

		if ( slideRect.width <= containerWidth ) {
			// Slide fits in container — align its leading edge to show it fully
			if ( isRtl ) {
				// RTL: align slide's right edge with container's right edge
				scrollTarget = scrollLeft + slideRightOffset;
			} else {
				// LTR: align slide's left edge with container's left edge
				scrollTarget = scrollLeft + slideLeftOffset;
			}
		} else if ( focusedElement !== slide ) {
			// Slide is wider than container — try to show the focused child element
			const focusRect = focusedElement.getBoundingClientRect();
			const focusLeftOffset = focusRect.left - containerRect.left;
			const focusRightOffset = focusRect.right - containerRect.right;

			// Check if focused element is already fully visible
			if ( focusLeftOffset >= -1 && focusRightOffset <= 1 ) {
				slider.container.style.scrollSnapType = '';
				slider.emit('programmaticScrollEnd');
				return;
			}

			if ( focusRect.width <= containerWidth ) {
				// Focused element fits in container — align its leading edge
				if ( isRtl ) {
					scrollTarget = scrollLeft + focusRightOffset;
				} else {
					scrollTarget = scrollLeft + focusLeftOffset;
				}
			} else {
				// Focused element is also wider than container — align leading edge
				if ( isRtl ) {
					scrollTarget = scrollLeft + focusRightOffset;
				} else {
					scrollTarget = scrollLeft + focusLeftOffset;
				}
			}
		} else {
			// Slide is the focused element and wider than container — align leading edge
			if ( isRtl ) {
				scrollTarget = scrollLeft + slideRightOffset;
			} else {
				scrollTarget = scrollLeft + slideLeftOffset;
			}
		}

		slider.emit('programmaticScrollStart');
		slider.container.scrollTo({ left: scrollTarget!, behavior: 'auto' });
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
			// When scrolled (at or near) the maximum, always report the last slide as active.
			// FullWidthPlugin's trailing margin can compress the remaining scrollable distance
			// near the end enough that the second-to-last slide's start position also satisfies
			// the loop's condition below, causing it to win (loop breaks on first match) even
			// though the container is fully scrolled to the last slide.
			const maxScrollLeft = Math.max( 0, slider.getInclusiveScrollWidth() - slider.container.offsetWidth );
			if ( slides.length > 0 && Math.floor( scrollLeft ) >= Math.floor( maxScrollLeft ) - 1 ) {
				activeSlideIdx = slides.length - 1;
				scrolledPastLastSlide = false;
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
		}


		if ( scrolledPastLastSlide ) {
			activeSlideIdx = slides.length - 1;
		}

		const oldActiveSlideIdx = slider.activeSlideIdx;
		slider.activeSlideIdx = activeSlideIdx;

		if (oldActiveSlideIdx !== activeSlideIdx) {
			slider.emit('activeSlideChanged');
		}
	}


	function moveToSlide( idx: number ) {
		const slide = slider.slides[idx];
		if (slide) {
			pendingSlideIdx = idx;
			ensureSlideIsInView(slide);
		}
	};

	function canMoveToSlide( idx: number ) : boolean {
		if ( idx < 0 || idx >= slider.slides.length ) {
			return false;
		}
		if (idx === slider.activeSlideIdx) {
			return false;
		}
		const direction = slider.options.rtl ? (idx < slider.activeSlideIdx ? 'backwards' : 'forwards') : (idx < slider.activeSlideIdx ? 'backwards' : 'forwards');

		// check if the slide is already in view
		const sliderRect = slider.container.getBoundingClientRect();
		const scrollLeft = slider.getScrollLeft();
		const containerWidth = slider.details.containerWidth;

		const hasUpcomingContent = slider.slides.some((s, i) => {
			if (i === slider.activeSlideIdx) {
				return false; // skip the slide we are checking
			}
			const sRect = s.getBoundingClientRect();
			const sStart = sRect.left - sliderRect.left + scrollLeft;
			const sEnd = sStart + sRect.width;
			if (slider.options.rtl) {
				if ( scrollLeft === 0 && slider.details.hasOverflow ) {
					return true;
				}
				return (direction === 'forwards' && i > slider.activeSlideIdx && Math.floor(sStart) < Math.floor(scrollLeft)) ||
					(direction === 'backwards' && i < slider.activeSlideIdx && Math.floor(sEnd) > Math.floor(scrollLeft + containerWidth));
			} else {
				return (direction === 'forwards' && i > slider.activeSlideIdx && Math.floor(sEnd) > Math.floor(scrollLeft + containerWidth)) ||
					(direction === 'backwards' && i < slider.activeSlideIdx && Math.floor(sStart) < Math.floor(scrollLeft));
			}
		});
		return hasUpcomingContent;
	}

	function moveToSlideInDirection( direction: 'prev' | 'next' ) {
		// If nothing is pending, slider.activeSlideIdx may be stale: it's only refreshed on
		// a scroll event + rAF, so it can still reflect the pre-drag/pre-snap slide right
		// after a manual scroll (e.g. drag + emulated scroll snap) settles. Recompute it
		// synchronously here so we always base the move on the real, current position.
		if ( pendingSlideIdx === null ) {
			setActiveSlideIdx();
		}
		// Prefer the pending (already requested but not yet confirmed) slide index over
		// activeSlideIdx so consecutive calls keep advancing one slide at a time instead
		// of repeatedly targeting the same slide while a previous scroll is still in flight.
		const activeSlideIdx = pendingSlideIdx ?? slider.activeSlideIdx;
		if (direction === 'prev') {
			if (activeSlideIdx > 0) {
				moveToSlide(activeSlideIdx - 1);
			}
		} else if (direction === 'next') {
			if (activeSlideIdx < slider.slides.length - 1) {
				moveToSlide(activeSlideIdx + 1);
			}
		}
	}

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
		const { slides, options, container } = slider;
		const {
			rtl,
			emulateScrollSnapMaxThreshold = 10,
			scrollBehavior = 'smooth',
		} = options;

		const isForward = rtl ? direction === 'prev' : direction === 'next';
		const scrollPos = getScrollLeft();

		// Get container rect once (includes any CSS transforms)
		const containerRect = container.getBoundingClientRect();
		const factor = rtl ? -1 : 1;

		// Use the same leftOffset (FullWidthPlugin's inline margin) as ensureSlideIsInView()/
		// setActiveSlideIdx() use, instead of recalculating it here from options.targetWidth.
		// The two calculations could disagree by a few pixels (e.g. options.targetWidth measured
		// against window.innerWidth while this measured against the container's own rendered
		// width, which can differ because of scrollbars), and any such mismatch between where
		// a drag lands and where the rest of the slider expects a "resting" slide to be can
		// throw off which slide is considered active - making the very next moveToSlideInDirection()
		// call move by an extra/too-few slide.
		const targetAreaOffset = getLeftOffset();

		// Build slide metadata
		const slideData = [...slides].map((slide, index) => {
			const { width } = slide.getBoundingClientRect();
			const slideRect = slide.getBoundingClientRect();

			// position relative to container's left edge
			const relativeStart = (slideRect.left - containerRect.left) + scrollPos;
			// Adjust trigger point to align with target area start instead of container edge
			const alignmentPoint = relativeStart - targetAreaOffset;
			const triggerPoint = Math.min(
				alignmentPoint + width / 2,
				alignmentPoint + emulateScrollSnapMaxThreshold
			);

			return { index, start: relativeStart - targetAreaOffset, trigger: triggerPoint };
		});

		// Pick the target start based on drag direction
		let targetStart = null;
		let targetIndex = null;

		if (isForward) {
			const found = slideData.find(item => scrollPos <= item.trigger);
			targetStart = found?.start ?? null;
			targetIndex = found?.index ?? null;
		} else {
			const found = [...slideData].reverse().find(item => scrollPos >= item.trigger);
			targetStart = found?.start ?? null;
			targetIndex = found?.index ?? null;
		}

		if (targetStart == null) return;

		// The snap animation (below) can take a while (smooth scrollBehavior) during which
		// scrollLeft is a moving target. If moveToSlideInDirection() is called while it's still
		// in flight (e.g. user clicks an arrow right after releasing a drag), its synchronous
		// activeSlideIdx recompute would read that moving position and could easily land on the
		// wrong slide, requiring an extra click to correct. Tracking the resolved target here,
		// the same way moveToSlide() does, makes that recompute unnecessary until the position
		// actually changes again (native scroll or another manual interaction).
		if (targetIndex !== null) {
			pendingSlideIdx = targetIndex;
		}

		// Clamp to zero and apply RTL factor
		let finalLeft = Math.max(0, Math.floor(targetStart)) * factor;

		// Also clamp to the real scrollable range, same as ensureSlideIsInView() does, so a
		// drag that settles near the last slide always lands exactly on the browser's real
		// max scroll position rather than a slightly different value that setActiveSlideIdx()
		// would then interpret as a different (earlier) slide being active.
		const maxScrollLeft = Math.max(0, slider.getInclusiveScrollWidth() - container.offsetWidth);
		if (!rtl) {
			finalLeft = Math.min(finalLeft, maxScrollLeft);
		} else {
			finalLeft = Math.max(finalLeft, -maxScrollLeft);
		}

		container.scrollTo({ left: finalLeft, behavior: scrollBehavior as ScrollBehavior });
	}

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
		canMoveToSlide,
		moveToSlide,
		moveToSlideInDirection,
		snapToClosestSlide,
		getInclusiveScrollWidth,
		getInclusiveClientWidth,
		getLeftOffset,
		getGapSize,
		getScrollLeft,
		setScrollLeft,
		setActiveSlideIdx,
		on,
		options,
	};

	init();

	return slider;
}
