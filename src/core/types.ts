export type Slider<O = {}, C = {}, H extends string = string> = {
	container: HTMLElement
	slides: HTMLElement[]
	emit: (name: H | SliderHooks) => void
	moveToDirection: (
		direction: 'prev' | 'next'
	) => void
	snapToClosestSlide: (
		direction: 'prev' | 'next'
	) => void
	moveToSlide: (
		index: number
	) => void
	on: (
		name: H | SliderHooks,
		cb: (props: Slider<O, C, H>) => void
	) => void
	options: SliderOptions,
	details: SliderDetails,
	activeSlideIdx: number,
} & C;

export type SliderOptions = {
	scrollBehavior: string;
	scrollStrategy: string;
	slidesSelector: string;
	emulateScrollSnap: boolean;
	emulateScrollSnapMaxThreshold: number;
	[key: string]: any;
}

export type SliderDetails = {
	hasOverflow: boolean;
	slideCount: number;
	containerWidth: number;
	scrollableAreaWidth: number;
	amountOfPages: number;
	currentPage: number;
}

export type SliderHooks =
	| HOOK_CREATED
	| HOOK_CONTENTS_CHANGED
	| HOOK_DETAILS_CHANGED
	| HOOK_CONTAINER_SIZE_CHANGED
	| HOOK_ACTIVE_SLIDE_CHANGED
	| HOOK_SCROLL_START
	| HOOK_SCROLL
	| HOOK_SCROLL_END
	| HOOK_NATIVE_SCROLL_START
	| HOOK_NATIVE_SCROLL
	| HOOK_NATIVE_SCROLL_END
	| HOOK_PROGRAMMATIC_SCROLL_START
	| HOOK_PROGRAMMATIC_SCROLL
	| HOOK_PROGRAMMATIC_SCROLL_END;

export type HOOK_CREATED = 'created';
export type HOOK_DETAILS_CHANGED = 'detailsChanged';
export type HOOK_CONTENTS_CHANGED = 'contentsChanged';
export type HOOK_CONTAINER_SIZE_CHANGED = 'containerSizeChanged';
export type HOOK_ACTIVE_SLIDE_CHANGED = 'activeSlideChanged';

// any type of scroll
export type HOOK_SCROLL_START = 'scrollStart';
export type HOOK_SCROLL = 'scroll';
export type HOOK_SCROLL_END = 'scrollEnd';

// user initted scroll (touch, mouse wheel, etc.)
export type HOOK_NATIVE_SCROLL_START = 'nativeScrollStart';
export type HOOK_NATIVE_SCROLL = 'nativeScroll';
export type HOOK_NATIVE_SCROLL_END = 'nativeScrollEnd';

// programmatic scroll (e.g. el.scrollTo)
export type HOOK_PROGRAMMATIC_SCROLL_START = 'programmaticScrollStart';
export type HOOK_PROGRAMMATIC_SCROLL = 'programmaticScroll';
export type HOOK_PROGRAMMATIC_SCROLL_END = 'programmaticScrollEnd';


export type SliderPlugin = (slider: Slider) => void;
