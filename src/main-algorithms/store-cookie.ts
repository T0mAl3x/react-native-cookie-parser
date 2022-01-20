// RFC 6265
// 5.3  Storage Model

import SInfo from 'react-native-sensitive-info'

import { matchDomain } from '../subcomponent-algorithms'
import { Cookie } from './parse-set-cookie-header'

/*
  The user agent stores the following fields about each cookie: name,
  value, expiry-time, domain, path, creation-time, last-access-time,
  persistent-flag, host-only-flag, secure-only-flag, and http-only-
  flag.
*/
export const storeCookie = async (
  cookie: Cookie,
  canonicalizedDomain: string
) => {
  /*
   A user agent MAY ignore a received cookie in its entirety.  For
   example, the user agent might wish to block receiving cookies
   from "third-party" responses or the user agent might not wish to
   store cookies that exceed some size.
  */
  // TODO mechanism of user agent settings

  /*
    Create a new cookie with name cookie-name, value cookie-value.
    Set the creation-time and the last-access-time to the current
    date and time.
  */
  let expiryTime = new Date(8640000000000000).toLocaleDateString()
  let domain = ''
  let path = '/'
  let creationTime = new Date().toLocaleDateString()
  let lastAccessTime = creationTime
  let persistentFlag = false
  let hostOnlyFlag = false
  let secureOnlyFlag = false

  /*
    If the cookie-attribute-list contains an attribute with an
    attribute-name of "Max-Age":

        Set the cookie's persistent-flag to true.

        Set the cookie's expiry-time to attribute-value of the last
        attribute in the cookie-attribute-list with an attribute-name
        of "Max-Age".

    Otherwise, if the cookie-attribute-list contains an attribute
    with an attribute-name of "Expires" (and does not contain an
    attribute with an attribute-name of "Max-Age"):

        Set the cookie's persistent-flag to true.

        Set the cookie's expiry-time to attribute-value of the last
        attribute in the cookie-attribute-list with an attribute-name
        of "Expires".

    Otherwise:

        Set the cookie's persistent-flag to false.

        Set the cookie's expiry-time to the latest representable
        date.
  */
  if ('Max-Age' in cookie.cookieAttributeList) {
    persistentFlag = true
    expiryTime = cookie.cookieAttributeList['Max-Age']
  } else if (
    'Expires' in cookie.cookieAttributeList &&
    !('Max-Age' in cookie.cookieAttributeList)
  ) {
    persistentFlag = true
    expiryTime = cookie.cookieAttributeList.Expires
  }

  /*
    If the cookie-attribute-list contains an attribute with an
    attribute-name of "Domain":

        Let the domain-attribute be the attribute-value of the last
        attribute in the cookie-attribute-list with an attribute-name
        of "Domain".

    Otherwise:

        Let the domain-attribute be the empty string.
  */
  if ('Domain' in cookie.cookieAttributeList) {
    domain = cookie.cookieAttributeList.Domain
  }

  /*
    If the user agent is configured to reject "public suffixes" and
    the domain-attribute is a public suffix:

        If the domain-attribute is identical to the canonicalized
        request-host:

            Let the domain-attribute be the empty string.
        Otherwise:

            Ignore the cookie entirely and abort these steps.
  */
  // TODO mechanism of user agent settings

  /*
    If the domain-attribute is non-empty:

        If the canonicalized request-host does not domain-match the
        domain-attribute:

            Ignore the cookie entirely and abort these steps.

        Otherwise:

            Set the cookie's host-only-flag to false.

            Set the cookie's domain to the domain-attribute.

    Otherwise:

        Set the cookie's host-only-flag to true.

        Set the cookie's domain to the canonicalized request-host.
  */
  if (cookie.cookieAttributeList.Domain !== '') {
    if (!matchDomain(canonicalizedDomain, cookie.cookieAttributeList.Domain))
      return false

    domain = cookie.cookieAttributeList.Domain
  } else {
    hostOnlyFlag = true
    domain = canonicalizedDomain
  }

  /*
    If the cookie-attribute-list contains an attribute with an
    attribute-name of "Path", set the cookie's path to attribute-
    value of the last attribute in the cookie-attribute-list with an
    attribute-name of "Path".  Otherwise, set the cookie's path to
    the default-path of the request-uri.
  */
  if ('Path' in cookie.cookieAttributeList) {
    path = cookie.cookieAttributeList.Path
  }

  /*
    If the cookie-attribute-list contains an attribute with an
    attribute-name of "Secure", set the cookie's secure-only-flag to
    true.  Otherwise, set the cookie's secure-only-flag to false.
  */
  if ('Secure' in cookie.cookieAttributeList) {
    secureOnlyFlag = true
  }

  /*
    If the cookie store contains a cookie with the same name,
    domain, and path as the newly created cookie:

        1.  Let old-cookie be the existing cookie with the same name,
            domain, and path as the newly created cookie.  (Notice that
            this algorithm maintains the invariant that there is at most
            one such cookie.)

        3.  Update the creation-time of the newly created cookie to
            match the creation-time of the old-cookie.

        4.  Remove the old-cookie from the cookie store.
  */
  let oldCookie = await parseCookieFromStore(cookie.cookieName)
  if (oldCookie) {
    if (oldCookie.domain === domain && oldCookie.path === path) {
      creationTime = oldCookie.creationTime
      await removeCookieFromStore(oldCookie.name)
    }
  }

  let currentTimeMillis = new Date().getMilliseconds()
  let expiryTimeMillis = Date.parse(expiryTime)
  if (expiryTimeMillis > currentTimeMillis) {
    let cookieValue = [
      cookie.cookieName,
      cookie.cookieValue,
      expiryTime,
      domain,
      path,
      creationTime,
      lastAccessTime,
      persistentFlag.toString(),
      hostOnlyFlag.toString(),
      secureOnlyFlag.toString(),
    ].join(';')
    await SInfo.setItem(cookie.cookieName, cookieValue, {
      sharedPreferencesName: 'auth-prefs',
      keychainService: 'auth-chain',
    })
  }
}

export const parseCookieFromStore = async (cookieName: string) => {
  let cookie = await SInfo.getItem(cookieName, {
    sharedPreferencesName: 'auth-prefs',
    keychainService: 'auth-chain',
  })
  if (!cookie) return null
  let cookieElements = cookie.split(';')
  if (cookieElements.length !== 10) return null

  return {
    name: cookieElements[0],
    value: cookieElements[1],
    expiryTime: cookieElements[2],
    domain: cookieElements[3],
    path: cookieElements[4],
    creationTime: cookieElements[5],
    lastAccessTime: cookieElements[6],
    persistentFlag: cookieElements[7],
    hostOnlyFlag: cookieElements[8],
    secureOnlyFlag: cookieElements[9],
  }
}

export const removeCookieFromStore = async (cookieName: string) => {
  await SInfo.deleteItem(cookieName, {
    sharedPreferencesName: 'auth-prefs',
    keychainService: 'auth-chain',
  })
}
