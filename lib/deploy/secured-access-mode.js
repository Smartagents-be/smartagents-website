function resolveSecuredAccessMode(rawMode = process.env.SECURED_ACCESS_MODE) {
  const normalized = String(rawMode || '').trim().toLowerCase();

  if (normalized === 'static' || normalized === 'github-pages' || normalized === 'github') {
    return 'static';
  }

  return 'cloudflare';
}

function supportsProtectedSecuredDocs(rawMode = process.env.SECURED_ACCESS_MODE) {
  return resolveSecuredAccessMode(rawMode) === 'cloudflare';
}

module.exports = {
  resolveSecuredAccessMode,
  supportsProtectedSecuredDocs
};
