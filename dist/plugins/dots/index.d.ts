import { DeepPartial, Slider } from '../core/index.d2.ts';

type DotsOptions = {
    type: 'view' | 'slide';
    texts: {
        dotDescription: string;
    };
    classNames: {
        dotsContainer: string;
        dotsItem: string;
    };
    container: HTMLElement | null;
};
declare function DotsPlugin(args?: DeepPartial<DotsOptions>): (slider: Slider) => void;

export { DotsPlugin as default };
export type { DotsOptions };
