export type Slider<O = {}, C = {}, H extends string = string> = {
	container: HTMLElement
	emit: (name: H | SliderHooks) => void
	moveToDirection: (
		direction: 'prev' | 'next'
	) => void
	on: (
		name: H | SliderHooks,
		cb: (props: Slider<O, C, H>) => void
	) => void
	options: SliderOptions,
	details: SliderDetails,
} & C;

export type SliderOptions = {
	scrollBehavior: string;
	scrollStrategy: string;
	slidesSelector: string;
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
	| HOOK_CONTAINER_SIZE_CHANGED;

export type HOOK_CREATED = 'created';
export type HOOK_DETAILS_CHANGED = 'detailsChanged';
export type HOOK_CONTENTS_CHANGED = 'contentsChanged';
export type HOOK_CONTAINER_SIZE_CHANGED = 'containerSizeChanged';

export type SliderPlugin = (slider: Slider) => void;
