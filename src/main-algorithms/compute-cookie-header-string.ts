import { URL } from 'react-native-url-polyfill'

import {
  canonicalizeDomain,
  getUriPath,
  matchDomain,
  matchPath,
} from '../subcomponent-algorithms'
import { StoreFormatCookie } from './store-cookie'

export const computeCookieHeaderString = (
  existingCookies: StoreFormatCookie[] | null,
  uri: string
) => {
  let cookieList: string[] = []
  if (existingCookies) {
    let canonicalizedDomain = canonicalizeDomain(uri)

    const url = new URL(uri)
    let isSecureProtocol = url ? url.protocol === 'https:' : false
    let currentDateTime = new Date()
    existingCookies.forEach((cookie) => {
      /*
              Either:
    
                The cookie's host-only-flag is true and the canonicalized
                request-host is identical to the cookie's domain.
    
              Or:
    
                The cookie's host-only-flag is false and the canonicalized
                request-host domain-matches the cookie's domain.
            */
      if (
        ((cookie.hostOnlyFlag && canonicalizedDomain === cookie.domain) ||
          (!cookie.hostOnlyFlag &&
            matchDomain(canonicalizedDomain, cookie.domain))) &&
        // The request-uri's path path-matches the cookie's path.
        matchPath(getUriPath(uri), cookie.path) &&
        /*
                If the cookie's secure-only-flag is true, then the request-
                uri's scheme must denote a "secure" protocol (as defined by
                the user agent).
              */
        ((cookie.secureOnlyFlag && isSecureProtocol) || !cookie.secureOnlyFlag)
      ) {
        cookie.lastAccessTime = currentDateTime
        cookieList.push(`${cookie.name}=${cookie.value}`)
      }
    })
  }

  return cookieList
}
