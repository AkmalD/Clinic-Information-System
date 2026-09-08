const blacklistedTokens = new Set();

function blacklistToken(token) {
  blacklistedTokens.add(token);
}

function isBlacklisted(token) {
  return blacklistedTokens.has(token);
}

module.exports = { blacklistToken, isBlacklisted };