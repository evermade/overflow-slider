import { Slider, DeepPartial } from '../../core/types';

export type AutoplayMovementTypes = 'view' | 'slide';

export type AutoplayPluginOptions = {
	/** Delay between auto-scrolls in milliseconds */
	delayInMs: number;
	/** Translatable button texts */
	texts: {
		play: string;
		pause: string;
	};
	/** Icons (SVG/html string) for play/pause states */
	icons: {
		play: string;
		pause: string;
	};
	/** CSS class names */
	classNames: {
		autoplayButton: string;
	};
	/** Container in which to insert controls (defaults before slider) */
	container: HTMLElement | null;
	/** Whether to advance by view or by slide */
	movementType: AutoplayMovementTypes;
	stopOnHover: boolean;
	loop: boolean;
};

export type AutoplayPluginArgs = DeepPartial<AutoplayPluginOptions>;

/**
 * Autoplay plugin for Overflow Slider
 *
 * Loops slides infinitely, always respects reduced-motion,
 * provides Play/Pause controls, and shows a progress bar.
 *
 * @param {AutoplayPluginArgs} args
 * @returns {(slider: Slider) => void}
 */
export default function AutoplayPlugin( args?: AutoplayPluginArgs ) {
	return ( slider: Slider ) => {
		const opts = <AutoplayPluginOptions>{
			delayInMs: args?.delayInMs ?? 5000,
			texts: {
				play:  args?.texts?.play  ?? 'Play',
				pause: args?.texts?.pause ?? 'Pause',
			},
			icons: {
				play:  args?.icons?.play  ??
					'<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/></svg>',
				pause: args?.icons?.pause ??
					'<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/></svg>',
			},
			container: args?.container ?? null,
			classNames: {
				autoplayButton: args?.classNames?.autoplayButton ?? 'overflow-slider__autoplay',
			},
			movementType: args?.movementType ?? 'view',
			stopOnHover: args?.stopOnHover ?? true,
			loop: args?.loop ?? true,
		};

		let intervalId: number | null = null;
		let rafId: number | null      = null;
		let startTime: number         = 0;
		let manualPause: boolean      = false;

		// a11y: respect reduced motion preference
		if ( window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches ) {
			return;
		}

		/**
		 * Create Play/Pause button and insert into DOM
		 * @private
		 * @returns {HTMLButtonElement}
		 */
		const createButton = (): HTMLButtonElement => {
			const btn = document.createElement( 'button' );
			btn.type = 'button';
			btn.className = opts.classNames.autoplayButton;
			setButtonPaused( btn );
			// initialize CSS var
			btn.style.setProperty( '--autoplay-delay-progress', '0' );

			if ( opts.container ) {
				opts.container.appendChild( btn );
			} else {
				slider.container.parentElement?.insertBefore( btn, slider.container );
			}

			// click toggles manual play/pause
			btn.addEventListener( 'click', () => {
				if ( intervalId ) {
					manualPause = true;
					stop();
				} else {
					manualPause = false;
					start();
				}
			} );

			// always pause on hover/focus (but don't clear manualPause)
			const pausableInteractionStart = [ 'focusin' ];
			if ( opts.stopOnHover ) {
				pausableInteractionStart.push( 'mouseenter');
			}

			const pausableInteractionEnd = [ 'focusout' ];
			if ( opts.stopOnHover ) {
				pausableInteractionEnd.push( 'mouseleave' );
			}

			pausableInteractionStart.forEach( evt =>
				slider.container.addEventListener( evt, () => {
					if ( intervalId ) stop();
				} )
			);
			pausableInteractionEnd.forEach( evt =>
				slider.container.addEventListener( evt, () => {
					if ( !intervalId && !manualPause ) start();
				} )
			);

			return btn;
		};

		const btn = createButton();

		/**
		 * Compute next slide, reset timer
		 *
		 * @private
		 */
		function scrollNext(): void {
			if ( opts.movementType === 'view' ) {
				const scrollLeft = slider.getScrollLeft();
				const viewWidth  = slider.getInclusiveClientWidth();
				const totalWidth = slider.getInclusiveScrollWidth();
				if ( scrollLeft + viewWidth >= totalWidth ) {
					if (opts.loop) {
						slider.moveToSlide( 0 );
					} else {
						stop();
						btn.style.setProperty( '--autoplay-delay-progress', '0' );
					}
				} else {
					slider.moveToDirection( 'next' );
				}
			} else {
				const nextIdx = ( slider.activeSlideIdx + 1 ) % slider.details.slideCount;
				if ( slider.canMoveToSlide( nextIdx ) ) {
					slider.moveToSlide( nextIdx );
				} else {
					if (opts.loop) {
						slider.moveToSlide( 0 );
					} else {
						stop();
						btn.style.setProperty( '--autoplay-delay-progress', '0' );
					}
				}
			}
			// reset progress timer
			startTime = performance.now();

			// restart the progress loop
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
			}
			tick();
		}

		/**
		 * Animation-loop to update CSS var
		 *
		 * @private
		 */
		function tick(): void {
			const now = performance.now();
			const pct = Math.min( (( now - startTime ) / opts.delayInMs) * 100, 100 );
			btn.style.setProperty( '--autoplay-delay-progress', `${Math.round( pct )}` );

			if ( pct < 100 ) {
				rafId = requestAnimationFrame( tick );
			}
		}

		/**
		 * Start autoplay
		 *
		 * @returns {void}
		 */
		function start(): void {
			if ( intervalId ) clearInterval( intervalId );
			if ( rafId )       cancelAnimationFrame( rafId );

			setButtonPlaying( btn );

			// reset timer and animate progress
			startTime = performance.now();
			tick();

			intervalId = window.setInterval( scrollNext, opts.delayInMs );
		}

		/**
		 * Stop autoplay
		 *
		 * @param {boolean} [fromManual=false] Whether this stop was user‐initiated
		 * @returns {void}
		 */
		function stop( fromManual = false ): void {
			if ( intervalId ) clearInterval( intervalId );
			if ( rafId )       cancelAnimationFrame( rafId );

			intervalId = rafId = null;
			if ( fromManual ) {
				manualPause = true;
			}
			setButtonPaused( btn );
		}

		/**
		 * Set button state to “playing”
		 *
		 * @private
		 * @param {HTMLElement} b
		 */
		function setButtonPlaying( b: HTMLElement ): void {
			b.setAttribute( 'aria-pressed', 'true' );
			b.setAttribute( 'aria-label', opts.texts.pause );
			const frag = document.createRange()
				.createContextualFragment( opts.icons.pause );
			b.innerHTML = '';
			b.appendChild( frag );
		}

		/**
		 * Set button state to “paused”
		 *
		 * @private
		 * @param {HTMLElement} b
		 */
		function setButtonPaused( b: HTMLElement ): void {
			b.setAttribute( 'aria-pressed', 'false' );
			b.setAttribute( 'aria-label', opts.texts.play );
			const frag = document.createRange()
				.createContextualFragment( opts.icons.play );
			b.innerHTML = '';
			b.appendChild( frag );
			b.style.setProperty( '--autoplay-delay-progress', '0' );
		}

		/**
		 * Pause/resume when slider enters/leaves viewport
		 * @private
		 */
		function observeVisibility(): void {
			const observer = new IntersectionObserver( entries => {
				for ( const e of entries ) {
					if ( !e.isIntersecting && intervalId ) {
						stop();
					} else if ( e.isIntersecting && !intervalId && !manualPause ) {
						start();
					}
				}
			}, { threshold: 0 } );
			observer.observe( slider.container );
		}

		// Initialize autoplay
		start();
		observeVisibility();
	};
}
