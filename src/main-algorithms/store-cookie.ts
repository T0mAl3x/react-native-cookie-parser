// RFC 6265
// 5.3  Storage Model

import { matchDomain } from '../subcomponent-algorithms'
import { Cookie } from './parse-set-cookie-header'

// HttpOnly flag is ignored because it is more specific to browsers
export class StoreFormatCookie {
  name: string = ''
  value: string = ''
  expiryTime: Date = new Date(864000000000000)
  domain: string = ''
  path: string = '/'
  creationTime: Date = new Date()
  lastAccessTime: Date = this.creationTime
  persistentFlag: boolean = false
  hostOnlyFlag: boolean = false
  secureOnlyFlag: boolean = false

  constructor(
    name: string = '',
    value: string = '',
    expiryTime: Date = new Date(864000000000000),
    domain: string = '',
    path: string = '',
    creationTime: Date = new Date(),
    lastAccessTime: Date | undefined = undefined,
    persistentFlag: boolean = false,
    hostOnlyFlag: boolean = false,
    secureOnlyFlag: boolean = false
  ) {
    this.name = name
    this.value = value
    this.expiryTime = expiryTime
    this.domain = domain
    this.path = path
    this.creationTime = creationTime
    this.lastAccessTime = lastAccessTime ? lastAccessTime : creationTime
    this.persistentFlag = persistentFlag
    this.hostOnlyFlag = hostOnlyFlag
    this.secureOnlyFlag = secureOnlyFlag
  }

  toString(): string {
    return [
      this.name,
      this.value,
      this.expiryTime.toLocaleString().replace(',', ''),
      this.domain,
      this.path,
      this.creationTime.toLocaleString().replace(',', ''),
      this.lastAccessTime.toLocaleString().replace(',', ''),
      this.persistentFlag.toString(),
      this.hostOnlyFlag.toString(),
      this.secureOnlyFlag.toString(),
    ].join('; ')
  }
  toComputedString(): string {
    return `${this.name}=${this.value}`
  }
}

/*
  The user agent stores the following fields about each cookie: name,
  value, expiry-time, domain, path, creation-time, last-access-time,
  persistent-flag, host-only-flag, secure-only-flag.
*/
export const formatCookieForStoring = async (
  cookie: Cookie,
  canonicalizedDomain: string
) => {
  try {
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
    let storeFormatCookie = new StoreFormatCookie()
    storeFormatCookie.name = cookie.cookieName
    storeFormatCookie.value = cookie.cookieValue

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
      storeFormatCookie.persistentFlag = true
      storeFormatCookie.expiryTime = new Date(
        Number(cookie.cookieAttributeList['Max-Age'])
      )
    } else if (
      'Expires' in cookie.cookieAttributeList &&
      !('Max-Age' in cookie.cookieAttributeList)
    ) {
      storeFormatCookie.persistentFlag = true
      storeFormatCookie.expiryTime = new Date(
        Number(cookie.cookieAttributeList.Expires)
      )
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
      storeFormatCookie.domain = cookie.cookieAttributeList.Domain
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
    if (cookie.cookieAttributeList.Domain) {
      if (!matchDomain(canonicalizedDomain, cookie.cookieAttributeList.Domain))
        return null

      storeFormatCookie.domain = cookie.cookieAttributeList.Domain
    } else {
      storeFormatCookie.hostOnlyFlag = true
      storeFormatCookie.domain = canonicalizedDomain
    }

    /*
      If the cookie-attribute-list contains an attribute with an
      attribute-name of "Path", set the cookie's path to attribute-
      value of the last attribute in the cookie-attribute-list with an
      attribute-name of "Path".  Otherwise, set the cookie's path to
      the default-path of the request-uri.
    */
    if ('Path' in cookie.cookieAttributeList) {
      storeFormatCookie.path = cookie.cookieAttributeList.Path
    }

    /*
      If the cookie-attribute-list contains an attribute with an
      attribute-name of "Secure", set the cookie's secure-only-flag to
      true.  Otherwise, set the cookie's secure-only-flag to false.
    */
    if ('Secure' in cookie.cookieAttributeList) {
      storeFormatCookie.secureOnlyFlag = true
    }

    return storeFormatCookie
  } catch (err) {
    console.log(err)
    return null
  }
}
