/**
 * Autoplay plugin for Overflow Slider
 *
 * Loops slides infinitely, always respects reduced-motion,
 * provides Play/Pause controls, and shows a progress bar.
 *
 * @param {AutoplayPluginArgs} args
 * @returns {(slider: Slider) => void}
 */
function AutoplayPlugin(args) {
    return (slider) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        const opts = {
            delayInMs: (_a = args === null || args === void 0 ? void 0 : args.delayInMs) !== null && _a !== void 0 ? _a : 5000,
            texts: {
                play: (_c = (_b = args === null || args === void 0 ? void 0 : args.texts) === null || _b === void 0 ? void 0 : _b.play) !== null && _c !== void 0 ? _c : 'Play',
                pause: (_e = (_d = args === null || args === void 0 ? void 0 : args.texts) === null || _d === void 0 ? void 0 : _d.pause) !== null && _e !== void 0 ? _e : 'Pause',
            },
            icons: {
                play: (_g = (_f = args === null || args === void 0 ? void 0 : args.icons) === null || _f === void 0 ? void 0 : _f.play) !== null && _g !== void 0 ? _g : '<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/></svg>',
                pause: (_j = (_h = args === null || args === void 0 ? void 0 : args.icons) === null || _h === void 0 ? void 0 : _h.pause) !== null && _j !== void 0 ? _j : '<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/></svg>',
            },
            container: (_k = args === null || args === void 0 ? void 0 : args.container) !== null && _k !== void 0 ? _k : null,
            classNames: {
                autoplayButton: (_m = (_l = args === null || args === void 0 ? void 0 : args.classNames) === null || _l === void 0 ? void 0 : _l.autoplayButton) !== null && _m !== void 0 ? _m : 'overflow-slider__autoplay',
            },
            movementType: (_o = args === null || args === void 0 ? void 0 : args.movementType) !== null && _o !== void 0 ? _o : 'view',
            stopOnHover: (_p = args === null || args === void 0 ? void 0 : args.stopOnHover) !== null && _p !== void 0 ? _p : true,
            loop: (_q = args === null || args === void 0 ? void 0 : args.loop) !== null && _q !== void 0 ? _q : true,
        };
        let intervalId = null;
        let rafId = null;
        let startTime = 0;
        let manualPause = false;
        // a11y: respect reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        /**
         * Create Play/Pause button and insert into DOM
         * @private
         * @returns {HTMLButtonElement}
         */
        const createButton = () => {
            var _a;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = opts.classNames.autoplayButton;
            setButtonPaused(btn);
            // initialize CSS var
            btn.style.setProperty('--autoplay-delay-progress', '0');
            if (opts.container) {
                opts.container.appendChild(btn);
            }
            else {
                (_a = slider.container.parentElement) === null || _a === void 0 ? void 0 : _a.insertBefore(btn, slider.container);
            }
            // click toggles manual play/pause
            btn.addEventListener('click', () => {
                if (intervalId) {
                    manualPause = true;
                    stop();
                }
                else {
                    manualPause = false;
                    start();
                }
            });
            // always pause on hover/focus (but don't clear manualPause)
            const pausableInteractionStart = ['focusin'];
            if (opts.stopOnHover) {
                pausableInteractionStart.push('mouseenter');
            }
            const pausableInteractionEnd = ['focusout'];
            if (opts.stopOnHover) {
                pausableInteractionEnd.push('mouseleave');
            }
            pausableInteractionStart.forEach(evt => slider.container.addEventListener(evt, () => {
                if (intervalId)
                    stop();
            }));
            pausableInteractionEnd.forEach(evt => slider.container.addEventListener(evt, () => {
                if (!intervalId && !manualPause)
                    start();
            }));
            return btn;
        };
        const btn = createButton();
        /**
         * Compute next slide, reset timer
         *
         * @private
         */
        function scrollNext() {
            if (opts.movementType === 'view') {
                const scrollLeft = slider.getScrollLeft();
                const viewWidth = slider.getInclusiveClientWidth();
                const totalWidth = slider.getInclusiveScrollWidth();
                if (scrollLeft + viewWidth >= totalWidth) {
                    if (opts.loop) {
                        slider.moveToSlide(0);
                    }
                    else {
                        stop();
                        btn.style.setProperty('--autoplay-delay-progress', '0');
                    }
                }
                else {
                    slider.moveToDirection('next');
                }
            }
            else {
                const nextIdx = (slider.activeSlideIdx + 1) % slider.details.slideCount;
                if (slider.canMoveToSlide(nextIdx)) {
                    slider.moveToSlide(nextIdx);
                }
                else {
                    if (opts.loop) {
                        slider.moveToSlide(0);
                    }
                    else {
                        stop();
                        btn.style.setProperty('--autoplay-delay-progress', '0');
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
        function tick() {
            const now = performance.now();
            const pct = Math.min(((now - startTime) / opts.delayInMs) * 100, 100);
            btn.style.setProperty('--autoplay-delay-progress', `${Math.round(pct)}`);
            if (pct < 100) {
                rafId = requestAnimationFrame(tick);
            }
        }
        /**
         * Start autoplay
         *
         * @returns {void}
         */
        function start() {
            if (intervalId)
                clearInterval(intervalId);
            if (rafId)
                cancelAnimationFrame(rafId);
            setButtonPlaying(btn);
            // reset timer and animate progress
            startTime = performance.now();
            tick();
            intervalId = window.setInterval(scrollNext, opts.delayInMs);
        }
        /**
         * Stop autoplay
         *
         * @param {boolean} [fromManual=false] Whether this stop was user‐initiated
         * @returns {void}
         */
        function stop(fromManual = false) {
            if (intervalId)
                clearInterval(intervalId);
            if (rafId)
                cancelAnimationFrame(rafId);
            intervalId = rafId = null;
            if (fromManual) {
                manualPause = true;
            }
            setButtonPaused(btn);
        }
        /**
         * Set button state to “playing”
         *
         * @private
         * @param {HTMLElement} b
         */
        function setButtonPlaying(b) {
            b.setAttribute('aria-pressed', 'true');
            b.setAttribute('aria-label', opts.texts.pause);
            const frag = document.createRange()
                .createContextualFragment(opts.icons.pause);
            b.innerHTML = '';
            b.appendChild(frag);
        }
        /**
         * Set button state to “paused”
         *
         * @private
         * @param {HTMLElement} b
         */
        function setButtonPaused(b) {
            b.setAttribute('aria-pressed', 'false');
            b.setAttribute('aria-label', opts.texts.play);
            const frag = document.createRange()
                .createContextualFragment(opts.icons.play);
            b.innerHTML = '';
            b.appendChild(frag);
            b.style.setProperty('--autoplay-delay-progress', '0');
        }
        /**
         * Pause/resume when slider enters/leaves viewport
         * @private
         */
        function observeVisibility() {
            const observer = new IntersectionObserver(entries => {
                for (const e of entries) {
                    if (!e.isIntersecting && intervalId) {
                        stop();
                    }
                    else if (e.isIntersecting && !intervalId && !manualPause) {
                        start();
                    }
                }
            }, { threshold: 0 });
            observer.observe(slider.container);
        }
        // Initialize autoplay
        start();
        observeVisibility();
    };
}

export { AutoplayPlugin as default };
