import { DeepPartial, Slider } from '../core/index.js';

type FullWidthOptions = {
    targetWidth?: (slider: Slider) => number;
    addMarginBefore: boolean;
    addMarginAfter: boolean;
};
declare function FullWidthPlugin(args?: DeepPartial<FullWidthOptions>): (slider: Slider) => void;

export { FullWidthPlugin as default };
export type { FullWidthOptions };
