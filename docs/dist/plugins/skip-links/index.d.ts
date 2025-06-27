import { DeepPartial, Slider } from '../core/index.d2.ts';

type SkipLinkOptions = {
    texts: {
        skipList: string;
    };
    classNames: {
        skipLink: string;
        skipLinkTarget: string;
    };
    containerBefore: HTMLElement | null;
    containerAfter: HTMLElement | null;
};
declare function SkipLinksPlugin(args?: DeepPartial<SkipLinkOptions>): (slider: Slider) => void;

export { SkipLinksPlugin as default };
export type { SkipLinkOptions };
