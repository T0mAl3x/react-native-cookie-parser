// RFC 6265
// 5.2.  The Set-Cookie Header

import {
  processDomainAttribute,
  processExpiresAttribute,
  processMaxAgeAttribute,
  processPathAttribute,
} from './process-cookie'

export interface Cookie {
  cookieName: string
  cookieValue: string
  cookieAttributeList: { [key: string]: string }
}

export const parseSetCookieHeader = (setCookieString: string) => {
  /*
    If the set-cookie-string contains a %x3B (";") character:

      The name-value-pair string consists of the characters up to,
      but not including, the first %x3B (";"), and the unparsed-
      attributes consist of the remainder of the set-cookie-string
      (including the %x3B (";") in question).

    Otherwise:

      The name-value-pair string consists of all the characters
      contained in the set-cookie-string, and the unparsed-
      attributes is the empty string.
  */
  let { nameValuePair, unparsedAttributes } = setCookieString.includes(';')
    ? {
        nameValuePair: setCookieString.substring(
          0,
          setCookieString.indexOf(';')
        ),
        unparsedAttributes: setCookieString.substring(
          setCookieString.indexOf(';'),
          setCookieString.length
        ),
      }
    : { nameValuePair: setCookieString, unparsedAttributes: '' }

  /*
    If the name-value-pair string lacks a %x3D ("=") character,
    ignore the set-cookie-string entirely.
  */
  if (!nameValuePair.includes('=')) return null

  /*
    The (possibly empty) name string consists of the characters up
    to, but not including, the first %x3D ("=") character, and the
    (possibly empty) value string consists of the characters after
    the first %x3D ("=") character.
  */
  let { cookieName, cookieValue } = {
    cookieName: nameValuePair.substring(0, nameValuePair.indexOf('=')),
    cookieValue: nameValuePair.substring(
      nameValuePair.indexOf('=') + 1,
      nameValuePair.length
    ),
  }

  /*
    Remove any leading or trailing WSP characters from the name
    string and the value string.
  */
  cookieName = cookieName.trim()
  cookieValue = cookieValue.trim()

  /*
    If the name string is empty, ignore the set-cookie-string
    entirely.
  */
  if (cookieName === '') return null

  /*
    If the unparsed-attributes string is empty, skip the rest of
    these steps.
  */
  let cookie: Cookie = {
    cookieName,
    cookieValue,
    cookieAttributeList: {},
  }
  while (unparsedAttributes !== '') {
    /*
      Discard the first character of the unparsed-attributes (which
      will be a %x3B (";") character).
    */
    unparsedAttributes = unparsedAttributes.substring(1)

    /*
      If the remaining unparsed-attributes contains a %x3B (";")
      character:

        Consume the characters of the unparsed-attributes up to, but
        not including, the first %x3B (";") character.

      Otherwise:

        Consume the remainder of the unparsed-attributes.
    */
    let cookieAv = ''
    if (unparsedAttributes.includes(';')) {
      cookieAv = unparsedAttributes.substring(
        0,
        unparsedAttributes.indexOf(';')
      )
    } else {
      cookieAv = unparsedAttributes.substring(0, unparsedAttributes.length)
    }
    unparsedAttributes = unparsedAttributes.substring(0, cookieAv.length)

    let { attributeName, attributeValue } = cookieAv.includes('=')
      ? {
          attributeName: cookieAv.substring(0, cookieAv.indexOf('=')),
          attributeValue: cookieAv.substring(
            cookieAv.indexOf('=') + 1,
            cookieAv.length
          ),
        }
      : { attributeName: cookieAv, attributeValue: '' }

    /*
      Remove any leading or trailing WSP characters from the attribute-
      name string and the attribute-value string.
    */
    attributeName = attributeName.trim()
    attributeValue = attributeValue.trim()

    /*
      Process the attribute-name and attribute-value. (Notice that
      attributes with unrecognized attribute-names are ignored.)
    */
    if (/expires/.test(attributeName.toLowerCase())) {
      let expiresDate = processExpiresAttribute(attributeValue)
      if (expiresDate)
        cookie.cookieAttributeList.Expires = expiresDate.toLocaleDateString()
    } else if (/max-age/.test(attributeName.toLowerCase())) {
      let expiresDate = processMaxAgeAttribute(attributeValue)
      if (expiresDate)
        cookie.cookieAttributeList['Max-Age'] = expiresDate.toLocaleDateString()
    } else if (/domain/.test(attributeName.toLowerCase())) {
      let cookieDomain = processDomainAttribute(attributeValue)
      if (cookieDomain) cookie.cookieAttributeList.Domain = cookieDomain
    } else if (/path/.test(attributeName.toLowerCase())) {
      let path = processPathAttribute(attributeValue)
      if (path) cookie.cookieAttributeList.Path = path
    } else if (/secure/.test(attributeName.toLowerCase())) {
      cookie.cookieAttributeList.Secure = ''
    }
  }

  return cookie
}
