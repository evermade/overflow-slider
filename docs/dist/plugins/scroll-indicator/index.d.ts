import { DeepPartial, Slider } from '../core/index.js';

type ScrollIndicatorOptions = {
    classNames: {
        scrollIndicator: string;
        scrollIndicatorBar: string;
        scrollIndicatorButton: string;
    };
    container: HTMLElement | null;
};
declare function ScrollIndicatorPlugin(args?: DeepPartial<ScrollIndicatorOptions>): (slider: Slider) => void;

export { ScrollIndicatorPlugin as default };
export type { ScrollIndicatorOptions };
