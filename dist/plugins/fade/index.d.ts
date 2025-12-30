import { DeepPartial, Slider } from '../core/index.d2.ts';

type FadeOptions = {
    classNames: {
        fadeItem: string;
        fadeItemStart: string;
        fadeItemEnd: string;
    };
    container: HTMLElement | null;
    containerStart: HTMLElement | null;
    containerEnd: HTMLElement | null;
};
declare function FadePlugin(args?: DeepPartial<FadeOptions>): (slider: Slider) => void;

export { FadePlugin as default };
export type { FadeOptions };
