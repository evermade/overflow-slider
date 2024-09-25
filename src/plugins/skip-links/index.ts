import { Slider } from '../../core/types';
import { generateId } from '../../core/utils';

const DEFAULT_TEXTS = {
	skipList: 'Skip list'
};

const DEFAULT_CLASS_NAMES = {
	skipLink: 'screen-reader-text',
	skipLinkTarget: 'overflow-slider__skip-link-target',
};

export type SkipLinkOptions = {
	texts: {
		skipList: string;
	},
	classNames: {
		skipLink: string;
		skipLinkTarget: string;
	},
	containerBefore: HTMLElement | null,
	containerAfter: HTMLElement | null,
};

export default function SkipLinksPlugin( args: { [key: string]: unknown } ) {
	return ( slider: Slider ) => {
		const options = <SkipLinkOptions>{
			texts: {
				...DEFAULT_TEXTS,
				...args?.texts || []
			},
			classNames: {
				...DEFAULT_CLASS_NAMES,
				...args?.classNames || []
			},
			containerBefore: args?.containerAfter ?? null,
			containerAfter: args?.containerAfter ?? null,
		};

		const skipId = generateId( 'overflow-slider-skip' );
		const skipLinkEl = document.createElement( 'a' );
		skipLinkEl.setAttribute( 'href', `#${skipId}` );
		skipLinkEl.textContent = options.texts.skipList;
		skipLinkEl.classList.add( options.classNames.skipLink );

		const skipTargetEl = document.createElement( 'div' );
		skipTargetEl.setAttribute( 'id', skipId );
		skipTargetEl.setAttribute( 'tabindex', '-1' );

		if ( options.containerBefore ) {
			options.containerBefore.parentNode?.insertBefore( skipLinkEl, options.containerBefore );
		} else {
			slider.container.parentNode?.insertBefore( skipLinkEl, slider.container );
		}
		if ( options.containerAfter ) {
			options.containerAfter.parentNode?.insertBefore( skipTargetEl, options.containerAfter.nextSibling );
		} else {
			slider.container.parentNode?.insertBefore( skipTargetEl, slider.container.nextSibling );
		}
	};
};
