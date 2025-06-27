function generateId(prefix, i = 1) {
    const id = `${prefix}-${i}`;
    if (document.getElementById(id)) {
        return generateId(prefix, i + 1);
    }
    return id;
}
function objectsAreEqual(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (let key of keys1) {
        // Use `Object.prototype.hasOwnProperty.call` for better safety
        if (!Object.prototype.hasOwnProperty.call(obj2, key) || obj1[key] !== obj2[key]) {
            return false;
        }
    }
    return true;
}
function getOutermostChildrenEdgeMarginSum(el) {
    if (el.children.length === 0) {
        return 0;
    }
    // get the first child and its left margin
    const firstChild = el.children[0];
    const firstChildStyle = getComputedStyle(firstChild);
    const firstChildMarginLeft = parseFloat(firstChildStyle.marginLeft);
    // Get the last child and its right margin
    const lastChild = el.children[el.children.length - 1];
    const lastChildStyle = getComputedStyle(lastChild);
    const lastChildMarginRight = parseFloat(lastChildStyle.marginRight);
    return firstChildMarginLeft + lastChildMarginRight;
}

export { getOutermostChildrenEdgeMarginSum as a, generateId as g, objectsAreEqual as o };
