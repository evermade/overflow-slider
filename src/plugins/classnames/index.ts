import { Slider, DeepPartial } from '../../core/types';

export type ClassnameOptions = {
	classNames: {
		visible: string;
		partlyVisible: string;
		hidden: string;
	},
	freezeStateOnVisible: boolean;
};

const DEFAULT_CLASS_NAMES: ClassnameOptions['classNames'] = {
	visible: 'is-visible',
	partlyVisible: 'is-partly-visible',
	hidden: 'is-hidden',
}

type VisibilityState = keyof ClassnameOptions['classNames'];

export default function ClassNamesPlugin( args?: DeepPartial<ClassnameOptions> ) {
	return ( slider: Slider ) => {

		const providedClassNames = args?.classNames ?? (args as { classnames?: DeepPartial<ClassnameOptions['classNames']> })?.classnames;

		const options = <ClassnameOptions>{
			classNames: {
				...DEFAULT_CLASS_NAMES,
				...providedClassNames ?? {},
			},
			freezeStateOnVisible: args?.freezeStateOnVisible ?? false,
		};

		const slideStates = new WeakMap<HTMLElement, VisibilityState>();
		const uniqueClassNames = Array.from(
			new Set(
				Object.values( options.classNames ).filter( ( className ): className is string => Boolean( className ) )
			)
		);

		const getTargetBounds = () => {
			const sliderRect = slider.container.getBoundingClientRect();
			const sliderWidth = sliderRect.width;
			if (!sliderWidth) {
				return { targetStart: sliderRect.left, targetEnd: sliderRect.right };
			}

			let targetWidth = 0;
			if ( typeof slider.options.targetWidth === 'function' ) {
				try {
					targetWidth = slider.options.targetWidth( slider );
				} catch ( error ) {
					targetWidth = 0;
				}
			}

			if ( !Number.isFinite( targetWidth ) || targetWidth <= 0 ) {
				targetWidth = sliderWidth;
			}

			const effectiveTargetWidth = Math.min( targetWidth, sliderWidth );
			const offset = ( sliderWidth - effectiveTargetWidth ) / 2;
			const clampedOffset = Math.max( offset, 0 );

			return {
				targetStart: sliderRect.left + clampedOffset,
				targetEnd: sliderRect.right - clampedOffset,
			};
		};

		const update = () => {
			const { targetStart, targetEnd } = getTargetBounds();

			console.log( 'targetStart:', targetStart, 'targetEnd:', targetEnd );

			slider.slides.forEach( ( slide ) => {
				const slideRect = slide.getBoundingClientRect();
				const slideLeft = slideRect.left;
				const slideRight = slideRect.right;

				const tolerance = 2;
				const overlapsTarget = (slideRight - tolerance) > targetStart && (slideLeft + tolerance) < targetEnd;
				const fullyInsideTarget = (slideLeft + tolerance) >= targetStart && (slideRight - tolerance) <= targetEnd;

				let nextState: VisibilityState = 'hidden';
				if ( overlapsTarget ) {
					nextState = fullyInsideTarget ? 'visible' : 'partlyVisible';
				}

				const prevState = slideStates.get( slide );

				// If freezeStateOnVisible is enabled and slide was previously visible, keep it frozen
				if ( options.freezeStateOnVisible && prevState === 'visible' ) {
					return;
				}

				if ( prevState === nextState ) {
					return;
				}

				const nextClass = options.classNames[ nextState ];
				if ( prevState ) {
					const prevClass = options.classNames[ prevState ];
					if ( prevClass !== nextClass && prevClass ) {
						slide.classList.remove( prevClass );
					}
				} else {
					uniqueClassNames.forEach( ( className ) => {
						if ( className !== nextClass ) {
							slide.classList.remove( className );
						}
					} );
				}

				if ( nextClass && !slide.classList.contains( nextClass ) ) {
					slide.classList.add( nextClass );
				}

				slideStates.set( slide, nextState );
			});
		};

		slider.on( 'created', update );
		slider.on( 'pluginsLoaded', update );
		slider.on( 'fullWidthPluginUpdate', update );
		slider.on( 'contentsChanged', update );
		slider.on( 'containerSizeChanged', update );
		slider.on( 'detailsChanged', update );
		slider.on( 'scrollEnd', update );
		slider.on( 'scrollStart', update );

		requestAnimationFrame(() => {
			requestAnimationFrame(() => update());
		});

		let requestId = 0;
		const debouncedUpdate = () => {
			if ( requestId ) {
				window.cancelAnimationFrame( requestId );
			}
			requestId = window.requestAnimationFrame(() => {
				update();
			});
		};
		slider.on('scroll', debouncedUpdate);

	};
}
