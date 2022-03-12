import SInfo from 'react-native-sensitive-info'

import { computeCookieHeaderString } from '../main-algorithms/compute-cookie-header-string'
import { parseSetCookieHeader } from '../main-algorithms/parse-set-cookie-header'
import {
  formatCookieForStoring,
  StoreFormatCookie,
} from '../main-algorithms/store-cookie'
import { canonicalizeDomain } from '../subcomponent-algorithms'

interface RNCookieParserProps {
  getConcatenatedCookies(domain: string): Promise<string | null>
  insertCookiesFromHeader(
    setCookieHeader: string,
    domain: string
  ): Promise<void>
  clear(): Promise<void>
}

interface RNTokenManagerProps {
  setAuthTokens(tokens: { [key: string]: string }): Promise<void>
  getAuthTokens(): Promise<{ [key: string]: string }>
  wipeAuthTokens(): Promise<void>
}

export class CookieManager implements RNCookieParserProps {
  PACKED_COOKIES_NAME: string = 'PACKED_COOKIES_NAME'

  constructor(packedCookiesNameInStore: string | null = null) {
    if (packedCookiesNameInStore) {
      this.PACKED_COOKIES_NAME = packedCookiesNameInStore
    }
  }

  async removeExpiredCookiesFromStore() {
    let existingCookies = await this.getCookiesFromStore()
    if (existingCookies) {
      let updatedCookieList = [...existingCookies]
      let currentDate = new Date().getMilliseconds()
      for (let i = 0; i < existingCookies.length; i++) {
        if (existingCookies[i].expiryTime.getMilliseconds() <= currentDate) {
          updatedCookieList = updatedCookieList.slice(i, i + 1)
        }
      }

      let formattedCookieList = updatedCookieList.map((cookie) =>
        cookie.toString()
      )
      await this.savePackedCookiesToStore(formattedCookieList)
    }
  }

  async savePackedCookiesToStore(packedCookies: string[]) {
    if (packedCookies.length > 0) {
      let packedFormattedCookies = packedCookies.join(', ')
      await SInfo.setItem(this.PACKED_COOKIES_NAME, packedFormattedCookies, {
        sharedPreferencesName: 'auth-prefs',
        keychainService: 'auth-chain',
      })
    }
  }

  async getConcatenatedCookies(uri: string): Promise<string | null> {
    /*
      A user agent MAY omit the Cookie header in its entirety.  For
      example, the user agent might wish to block sending cookies during
      "third-party" requests from setting cookies.
    */
    // TODO mechanism of user agent settings

    // Check store for expired cookies
    this.removeExpiredCookiesFromStore()

    let existingCookies = await this.getCookiesFromStore()
    let computedCookies = computeCookieHeaderString(existingCookies, uri)
    if (computedCookies) return computedCookies.join('; ')

    return null
  }

  parseCookiesFromHeader(setCookiesHeader: string): string[] | null {
    // Separate cookies from bulk string
    let cookies = setCookiesHeader.split(', ')

    return cookies
  }

  async getCookiesFromStore(): Promise<StoreFormatCookie[] | null> {
    let bulkCookiesFromStore = await SInfo.getItem(this.PACKED_COOKIES_NAME, {
      sharedPreferencesName: 'auth-prefs',
      keychainService: 'auth-chain',
    })
    if (!bulkCookiesFromStore) return null

    let cookiesFromStore = this.parseCookiesFromHeader(bulkCookiesFromStore)
    if (cookiesFromStore) {
      let cookies = cookiesFromStore.map((cookieFromStore) => {
        let cookieElements = cookieFromStore.split('; ')
        console.log(cookieElements[2])
        console.log(new Date(cookieElements[2]))
        let cookieObject: StoreFormatCookie = new StoreFormatCookie(
          cookieElements[0],
          cookieElements[1],
          new Date(cookieElements[2]),
          cookieElements[3],
          cookieElements[4],
          new Date(cookieElements[5]),
          new Date(cookieElements[6]),
          cookieElements[7] === 'true',
          cookieElements[8] === 'true',
          cookieElements[9] === 'true'
        )

        return cookieObject
      })

      return cookies
    }

    return null
  }

  async insertCookiesFromHeader(
    setCookieHeader: string,
    domain: string
  ): Promise<void> {
    if (setCookieHeader) {
      // await this.clear()
      let cookies = this.parseCookiesFromHeader(setCookieHeader)
      if (cookies && cookies.length > 0) {
        // Check store for expired cookies
        this.removeExpiredCookiesFromStore()

        // Initialize cookie list with existing cookies from store
        let existingCookies = await this.getCookiesFromStore()
        if (!existingCookies) existingCookies = []

        console.log('Initialize cookie list with existing cookies from store')
        console.log(existingCookies)

        for (let i = 0; i < cookies.length; i++) {
          // Parse raw cookie from server
          let cookie = parseSetCookieHeader(cookies[i])
          console.log(cookie)
          if (cookie) {
            // Prepare cookie for storage
            let canonicalDomain = canonicalizeDomain(domain)
            if (canonicalDomain) {
              let formattedCookie = await formatCookieForStoring(
                cookie,
                canonicalDomain
              )

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
              if (formattedCookie) {
                let oldCookieIndex: number = existingCookies.findIndex(
                  (cookieObject) =>
                    cookieObject.name === formattedCookie!.name &&
                    cookieObject.domain === formattedCookie!.domain &&
                    cookieObject.path === formattedCookie!.path
                )

                if (oldCookieIndex !== -1) {
                  let oldCookie = existingCookies[oldCookieIndex]
                  formattedCookie.creationTime = oldCookie.creationTime
                  existingCookies.splice(oldCookieIndex, oldCookieIndex + 1)
                }

                existingCookies.push(formattedCookie)
              }
            }
          }
        }

        let formattedCookiesForStoring: string[] = [
          ...existingCookies.map((cookieObject) => cookieObject.toString()),
        ]

        await this.savePackedCookiesToStore(formattedCookiesForStoring)
      }
    }
  }

  async clear(): Promise<void> {
    await SInfo.deleteItem(this.PACKED_COOKIES_NAME, {
      sharedPreferencesName: 'auth-prefs',
      keychainService: 'auth-chain',
    })
  }
}

export class TokenManager implements RNTokenManagerProps {
  TOKENS: string[] = []

  constructor(tokenKeys: string[]) {
    this.TOKENS = [...tokenKeys]
  }

  async setAuthTokens(tokens: { [key: string]: string }): Promise<void> {
    this.TOKENS.forEach(async (tokenKey) => {
      if (tokenKey in Object.keys(tokens)) {
        await SInfo.setItem(tokenKey, tokens.tokenKey, {
          sharedPreferencesName: 'auth-prefs',
          keychainService: 'auth-chain',
        })
      }
    })
  }

  async getAuthTokens(): Promise<{ [key: string]: string }> {
    let tokens: { [key: string]: string } = {}

    this.TOKENS.forEach(async (tokenKey: string) => {
      let token = await SInfo.getItem(tokenKey, {
        sharedPreferencesName: 'auth-prefs',
        keychainService: 'auth-chain',
      })
      tokens.tokenKey = token
    })

    return tokens
  }

  async wipeAuthTokens(): Promise<void> {
    this.TOKENS.forEach(async (tokenKey: string) => {
      await SInfo.deleteItem(tokenKey, {
        sharedPreferencesName: 'auth-prefs',
        keychainService: 'auth-chain',
      })
    })
  }
}
