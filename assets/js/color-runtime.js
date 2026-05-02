function readTokenValue(tokenName, target) {
    var source = target || document.documentElement;
    var localValue = getComputedStyle(source).getPropertyValue(tokenName).trim();
    if (localValue) return localValue;
    return getComputedStyle(document.documentElement).getPropertyValue(tokenName).trim();
}

function rgbaString(rgbValue, alpha) {
    return 'rgba(' + rgbValue + ', ' + alpha + ')';
}

function buildParticlePalette(target) {
    return ['--cyan-rgb', '--blue-rgb']
        .map(function(tokenName) {
            return readTokenValue(tokenName, target);
        })
        .filter(Boolean);
}

window.SmartAgentsColorRuntime = {
    readTokenValue: readTokenValue,
    rgbaString: rgbaString,
    buildParticlePalette: buildParticlePalette
};
