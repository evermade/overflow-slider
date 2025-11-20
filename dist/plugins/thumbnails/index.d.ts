import { DeepPartial, Slider } from '../core/index.d2.ts';

type ThumbnailsOptions = {
    mainSlider: Slider;
};
declare function FullWidthPlugin(args: DeepPartial<ThumbnailsOptions>): (slider: Slider) => void;

export { FullWidthPlugin as default };
export type { ThumbnailsOptions };
