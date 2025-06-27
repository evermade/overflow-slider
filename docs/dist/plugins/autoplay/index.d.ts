import { DeepPartial, Slider } from '../core/index.d2.ts';

type AutoplayMovementTypes = 'view' | 'slide';
type AutoplayPluginOptions = {
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
type AutoplayPluginArgs = DeepPartial<AutoplayPluginOptions>;
/**
 * Autoplay plugin for Overflow Slider
 *
 * Loops slides infinitely, always respects reduced-motion,
 * provides Play/Pause controls, and shows a progress bar.
 *
 * @param {AutoplayPluginArgs} args
 * @returns {(slider: Slider) => void}
 */
declare function AutoplayPlugin(args?: AutoplayPluginArgs): (slider: Slider) => void;

export { AutoplayPlugin as default };
export type { AutoplayMovementTypes, AutoplayPluginArgs, AutoplayPluginOptions };
