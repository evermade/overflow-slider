type Slider<O = {}, C = {}, H extends string = string> = {
    container: HTMLElement;
    slides: HTMLElement[];
    emit: (name: H | SliderHooks) => void;
    moveToDirection: (direction: 'prev' | 'next') => void;
    moveToSlideInDirection: (direction: 'prev' | 'next') => void;
    snapToClosestSlide: (direction: 'prev' | 'next') => void;
    moveToSlide: (index: number) => void;
    canMoveToSlide: (index: number) => boolean;
    getInclusiveScrollWidth: () => number;
    getInclusiveClientWidth: () => number;
    getScrollLeft: () => number;
    setScrollLeft: (value: number) => void;
    setActiveSlideIdx: () => void;
    on: (name: H | SliderHooks, cb: SliderCallback) => void;
    options: SliderOptions;
    details: SliderDetails;
    activeSlideIdx: number;
} & C;
type SliderCallback<O = {}, C = {}, H extends string = string> = (props: Slider<O, C, H>) => void;
/**
 * Recursively makes all properties of T optional.
 * @see https://www.typescriptlang.org/docs/handbook/utility-types.html#mapped-types
 */
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
type SliderOptions = {
    scrollBehavior: string;
    scrollStrategy: string;
    slidesSelector: string;
    emulateScrollSnap: boolean;
    emulateScrollSnapMaxThreshold?: number;
    cssVariableContainer: HTMLElement;
    rtl: boolean;
    targetWidth?: (slider: Slider) => number;
    [key: string]: unknown;
};
type SliderOptionArgs = {
    scrollBehavior?: 'smooth' | 'auto';
    scrollStrategy?: 'fullSlide' | 'partialSlide';
    slidesSelector?: string;
    emulateScrollSnap?: boolean;
    emulateScrollSnapMaxThreshold?: number;
    cssVariableContainer?: HTMLElement;
    rtl?: boolean;
    [key: string]: unknown;
};
type SliderDetails = {
    hasOverflow: boolean;
    slideCount: number;
    containerWidth: number;
    containerHeight: number;
    scrollableAreaWidth: number;
    amountOfPages: number;
    currentPage: number;
};
type SliderHooks = HOOK_CREATED | HOOK_CONTENTS_CHANGED | HOOK_DETAILS_CHANGED | HOOK_CONTAINER_SIZE_CHANGED | HOOK_ACTIVE_SLIDE_CHANGED | HOOK_SCROLL_START | HOOK_SCROLL | HOOK_SCROLL_END | HOOK_NATIVE_SCROLL_START | HOOK_NATIVE_SCROLL | HOOK_NATIVE_SCROLL_END | HOOK_PROGRAMMATIC_SCROLL_START | HOOK_PROGRAMMATIC_SCROLL | HOOK_PROGRAMMATIC_SCROLL_END;
type HOOK_CREATED = 'created';
type HOOK_DETAILS_CHANGED = 'detailsChanged';
type HOOK_CONTENTS_CHANGED = 'contentsChanged';
type HOOK_CONTAINER_SIZE_CHANGED = 'containerSizeChanged';
type HOOK_ACTIVE_SLIDE_CHANGED = 'activeSlideChanged';
type HOOK_SCROLL_START = 'scrollStart';
type HOOK_SCROLL = 'scroll';
type HOOK_SCROLL_END = 'scrollEnd';
type HOOK_NATIVE_SCROLL_START = 'nativeScrollStart';
type HOOK_NATIVE_SCROLL = 'nativeScroll';
type HOOK_NATIVE_SCROLL_END = 'nativeScrollEnd';
type HOOK_PROGRAMMATIC_SCROLL_START = 'programmaticScrollStart';
type HOOK_PROGRAMMATIC_SCROLL = 'programmaticScroll';
type HOOK_PROGRAMMATIC_SCROLL_END = 'programmaticScrollEnd';
type SliderPlugin = (slider: Slider) => void;

export type { DeepPartial, HOOK_ACTIVE_SLIDE_CHANGED, HOOK_CONTAINER_SIZE_CHANGED, HOOK_CONTENTS_CHANGED, HOOK_CREATED, HOOK_DETAILS_CHANGED, HOOK_NATIVE_SCROLL, HOOK_NATIVE_SCROLL_END, HOOK_NATIVE_SCROLL_START, HOOK_PROGRAMMATIC_SCROLL, HOOK_PROGRAMMATIC_SCROLL_END, HOOK_PROGRAMMATIC_SCROLL_START, HOOK_SCROLL, HOOK_SCROLL_END, HOOK_SCROLL_START, Slider, SliderCallback, SliderDetails, SliderHooks, SliderOptionArgs, SliderOptions, SliderPlugin };
