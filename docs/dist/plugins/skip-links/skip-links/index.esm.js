import { generateId } from '../../../core/utils.esm.js';

const DEFAULT_TEXTS = {
    skipList: 'Skip list'
};
const DEFAULT_CLASS_NAMES = {
    skipLink: 'screen-reader-text',
    skipLinkTarget: 'overflow-slider__skip-link-target',
};
function SkipLinksPlugin(args) {
    return (slider) => {
        var _a, _b, _c, _d, _e, _f;
        const options = {
            texts: Object.assign(Object.assign({}, DEFAULT_TEXTS), (args === null || args === void 0 ? void 0 : args.texts) || []),
            classNames: Object.assign(Object.assign({}, DEFAULT_CLASS_NAMES), (args === null || args === void 0 ? void 0 : args.classNames) || []),
            containerBefore: (_a = args === null || args === void 0 ? void 0 : args.containerAfter) !== null && _a !== void 0 ? _a : null,
            containerAfter: (_b = args === null || args === void 0 ? void 0 : args.containerAfter) !== null && _b !== void 0 ? _b : null,
        };
        const skipId = generateId('overflow-slider-skip');
        const skipLinkEl = document.createElement('a');
        skipLinkEl.setAttribute('href', `#${skipId}`);
        skipLinkEl.textContent = options.texts.skipList;
        skipLinkEl.classList.add(options.classNames.skipLink);
        const skipTargetEl = document.createElement('div');
        skipTargetEl.setAttribute('id', skipId);
        skipTargetEl.setAttribute('tabindex', '-1');
        if (options.containerBefore) {
            (_c = options.containerBefore.parentNode) === null || _c === void 0 ? void 0 : _c.insertBefore(skipLinkEl, options.containerBefore);
        }
        else {
            (_d = slider.container.parentNode) === null || _d === void 0 ? void 0 : _d.insertBefore(skipLinkEl, slider.container);
        }
        if (options.containerAfter) {
            (_e = options.containerAfter.parentNode) === null || _e === void 0 ? void 0 : _e.insertBefore(skipTargetEl, options.containerAfter.nextSibling);
        }
        else {
            (_f = slider.container.parentNode) === null || _f === void 0 ? void 0 : _f.insertBefore(skipTargetEl, slider.container.nextSibling);
        }
    };
}

export { SkipLinksPlugin as default };
