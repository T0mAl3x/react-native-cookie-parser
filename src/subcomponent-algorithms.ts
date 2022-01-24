export const matchDomain = (stringToMatch: string, domain: string) => {
  if (stringToMatch === domain) return true

  let validHostnameRegex =
    /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/g
  if (
    stringToMatch.endsWith(domain) &&
    stringToMatch.length > 0 &&
    stringToMatch[stringToMatch.length - 1] === '.' &&
    !domain.includes('.') &&
    stringToMatch.match(validHostnameRegex)
  )
    return true

  return false
}

export const canonicalizeDomain = (rawDomain: string) => {
  let canonicalDomainRegex = /@?\b(\w*[^\W\d]+\w*\.+)+[^\W\d_]{2,}\b/g
  let canonicalDomain = rawDomain.match(canonicalDomainRegex)

  if (canonicalDomain && canonicalDomain.length === 1) {
    return canonicalDomain[0]
  }

  return null
}
