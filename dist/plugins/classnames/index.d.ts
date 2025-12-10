import { DeepPartial, Slider } from '../core/index.js';

type ClassnameOptions = {
    classNames: {
        visible: string;
        partlyVisible: string;
        hidden: string;
    };
    freezeStateOnVisible: boolean;
};
declare function ClassNamesPlugin(args?: DeepPartial<ClassnameOptions>): (slider: Slider) => void;

export { ClassNamesPlugin as default };
export type { ClassnameOptions };
