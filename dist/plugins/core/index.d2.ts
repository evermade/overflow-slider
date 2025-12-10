import { SliderOptionArgs, SliderPlugin, SliderCallback, SliderOptions, SliderDetails } from './index.js';

declare function OverflowSlider(container: HTMLElement, options?: SliderOptionArgs, plugins?: SliderPlugin[]): {
    container: HTMLElement;
    slides: HTMLElement[];
    emit: (name: string) => void;
    moveToDirection: (direction: "prev" | "next") => void;
    moveToSlideInDirection: (direction: "prev" | "next") => void;
    snapToClosestSlide: (direction: "prev" | "next") => void;
    moveToSlide: (index: number) => void;
    canMoveToSlide: (index: number) => boolean;
    getInclusiveScrollWidth: () => number;
    getInclusiveClientWidth: () => number;
    getGapSize: () => number;
    getLeftOffset: () => number;
    getScrollLeft: () => number;
    setScrollLeft: (value: number) => void;
    setActiveSlideIdx: () => void;
    on: (name: string, cb: SliderCallback) => void;
    options: SliderOptions;
    details: SliderDetails;
    activeSlideIdx: number;
} | undefined;

export { OverflowSlider as default };
