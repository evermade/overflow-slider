import { DeepPartial, Slider } from '../core/index.d2.ts';

type ThumbnailsOptions = {
    mainSlider: Slider;
};
declare function ThumbnailPlugin(args: DeepPartial<ThumbnailsOptions>): (slider: Slider) => void;

export { ThumbnailPlugin as default };
export type { ThumbnailsOptions };
