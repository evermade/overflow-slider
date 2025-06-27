import { DeepPartial, Slider } from '../core/index.d2.ts';

type ArrowsMovementTypes = 'view' | 'slide';
type ArrowsOptions = {
    texts: {
        buttonPrevious: string;
        buttonNext: string;
    };
    icons: {
        prev: string;
        next: string;
    };
    classNames: {
        navContainer: string;
        prevButton: string;
        nextButton: string;
    };
    container: HTMLElement | null;
    containerPrev: HTMLElement | null;
    containerNext: HTMLElement | null;
    movementType: ArrowsMovementTypes;
};
declare function ArrowsPlugin(args?: DeepPartial<ArrowsOptions>): (slider: Slider) => void;

export { ArrowsPlugin as default };
export type { ArrowsMovementTypes, ArrowsOptions };
