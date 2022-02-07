export const matchDomain = (stringToMatch: string | null, domain: string) => {
  if (!stringToMatch) return false
  if (stringToMatch === domain) return true

  let validHostnameRegex =
    /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/g
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

export const getUriComponents = (uri: string) => {
  let uriComponentsRegex =
    /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/g
  let uriComponents = uri.match(uriComponentsRegex)

  return uriComponents
}

export const getUriPath = (uri: string) => {
  let uriComponents = getUriComponents(uri)
  if (uriComponents && uriComponents.length > 4) {
    return uriComponents[4]
  }

  return '/'
}

export const matchPath = (uriPath: string, cookiePath: string) => {
  // The cookie-path and the request-path are identical.
  if (uriPath === cookiePath) return true
  /*
    The cookie-path is a prefix of the request-path, and the last
    character of the cookie-path is %x2F ("/").
  */
  if (uriPath.startsWith(cookiePath) && cookiePath.endsWith('/')) return true
  /*
    The cookie-path is a prefix of the request-path, and the first
    character of the request-path that is not included in the cookie-
    path is a %x2F ("/") character.
  */
  // if (uriPath.startsWith(cookiePath) && ) TODO ???

  return false
}
