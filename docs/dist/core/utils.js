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
        if (obj2.hasOwnProperty(key) === false || obj1[key] !== obj2[key]) {
            return false;
        }
    }
    return true;
}

export { generateId, objectsAreEqual };
