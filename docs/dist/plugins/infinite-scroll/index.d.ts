import { SliderPlugin } from '../core/index.d2.ts';

/**
 * Infinite‐scroll plugin
 *
 * Experimental work-in-progress not available for public use yet.
 */

/**
 * @typedef {Object} InfiniteScrollOptions
 * @property {number} [lookAheadCount=1] Number of slides to look ahead when deciding to reparent.
 */
/**
 * Creates an infinite scroll plugin for a slider that re-parents multiple slides
 * before hitting the container edge, to avoid blank space and keep the same
 * active slide visible.
 *
 * @param {InfiniteScrollOptions} [options] Plugin configuration.
 * @returns {SliderPlugin} The configured slider plugin.
 */
declare function InfiniteScrollPlugin(options?: {
    lookAheadCount?: number;
}): SliderPlugin;

export { InfiniteScrollPlugin as default };
