import { DeepPartial, Slider } from '../core/index.js';

type DragScrollingOptions = {
    draggedDistanceThatPreventsClick: number;
};
declare function DragScrollingPlugin(args?: DeepPartial<DragScrollingOptions>): (slider: Slider) => void;

export { DragScrollingPlugin as default };
export type { DragScrollingOptions };
