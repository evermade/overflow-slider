function generateId(prefix, i = 1) {
    const id = `${prefix}-${i}`;
    if (document.getElementById(id)) {
        return generateId(prefix, i + 1);
    }
    return id;
}

export { generateId };
