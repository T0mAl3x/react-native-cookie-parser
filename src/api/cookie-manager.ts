import SInfo from 'react-native-sensitive-info'

import { parseSetCookieHeader } from '../main-algorithms/parse-set-cookie-header'
import { storeCookie, StoreFormatCookie } from '../main-algorithms/store-cookie'
import { canonicalizeDomain } from '../subcomponent-algorithms'

interface RNCookieParserProps {
  getConcatenatedCookies(): Promise<string | null>
  parseCookiesFromHeader(setCookiesHeader: string): string[] | null
  insertCookiesFromHeader(
    setCookieHeader: string,
    domain: string
  ): Promise<void>
  // updateCookie(cookieName: string): void
  checkCookieValidity(cookie: string): boolean
  deleteCookie(cookie: string): Promise<void>
  clear(): Promise<void>
}

interface RNTokenManagerProps {
  setAuthTokens(tokens: { [key: string]: string }): Promise<void>
  getAuthTokens(): Promise<{ [key: string]: string }>
  wipeAuthTokens(): Promise<void>
}

export class CookieManager implements RNCookieParserProps {
  PACKED_COOKIES_NAME: string = 'PACKED_COOKIES_NAME'

  constructor(packedCookiesNameInStore: string | null) {
    if (packedCookiesNameInStore) {
      this.PACKED_COOKIES_NAME = packedCookiesNameInStore
    }
  }

  async getConcatenatedCookies(): Promise<string | null> {
    let cookies: string[] = []

    for (let i = 0; i < this.COOKIES.length; i++) {
      let cookie = await SInfo.getItem(this.COOKIES[i], {
        sharedPreferencesName: 'auth-prefs',
        keychainService: 'auth-chain',
      })

      if (cookie) {
        cookies.push(cookie)
      }
    }
    console.log(cookies)
    if (cookies.length === 0) return null

    let concatCookies = ''
    let expiredFlag = false

    for (let i = 0; i < cookies.length - 1; i++) {
      if (!this.checkCookieValidity(cookies[i])) {
        await this.deleteCookie(cookies[i])
        expiredFlag = true
        break
      }
      concatCookies += cookies[i] + '; '
    }

    if (!expiredFlag) return concatCookies
    return null
  }

  parseCookiesFromHeader(setCookiesHeader: string): string[] | null {
    // Separate cookies from bulk string
    let cookieRegex = /(.*?)=(.*?)($|;|,(?! ))/g
    let cookies = setCookiesHeader.match(cookieRegex)

    return cookies
  }

  getCookiesFromStore(): StoreFormatCookie[] | null {
    let bulkCookiesFromStore = await SInfo.getItem(this.PACKED_COOKIES_NAME, {
      sharedPreferencesName: 'auth-prefs',
      keychainService: 'auth-chain',
    })
    let cookiesFromStore = this.parseCookiesFromHeader(bulkCookiesFromStore)

    if (cookiesFromStore) {
      let cookies = cookiesFromStore.map((cookieFromStore) => {
        let cookieElements = cookieFromStore.split('; ')
        let cookieObject: StoreFormatCookie = {
          name: cookieElements[0],
          value: cookieElements[1],
          expiryTime: new Date(cookieElements[2]),
          domain: cookieElements[3],
          path: cookieElements[4],
          creationTime: new Date(cookieElements[5]),
          lastAccessTime: new Date(cookieElements[6]),
          persistentFlag: cookieElements[7] === 'true',
          hostOnlyFlag: cookieElements[8] === 'true',
          secureOnlyFlag: cookieElements[9] === 'true',
        }

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
      let cookies = this.parseCookiesFromHeader(setCookieHeader)
      if (cookies && cookies.length > 0) {
        // Initialize cookie list with existing cookies from store
        let existingCookies = this.getCookiesFromStore()
        let formattedCookiesForStoring: string[] = existingCookies
          ? [...existingCookies.map((cookieObject) => cookieObject.toString())]
          : []

        for (let i = 0; i < cookies.length; i++) {
          // Parse raw cookie from server
          let cookie = parseSetCookieHeader(cookies[i])

          if (cookie) {
            // Prepare cookie for storage
            let canonicalDomain = canonicalizeDomain(domain)
            if (canonicalDomain) {
              let formattedCookie = await storeCookie(cookie, canonicalDomain)
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
                let oldCookie: StoreFormatCookie | null = existingCookies
                  ? existingCookies.find(
                      (cookieObject) =>
                        cookieObject.name === formattedCookie.name &&
                        cookieObject.domain === formattedCookie.domain &&
                        cookieObject.path === formattedCookie.path
                    )
                  : null

                if (oldCookie) {
                  for (let i = 0; i < formattedCookiesForStoring.length; i++) {
                    if (
                      formattedCookiesForStoring[i].includes(oldCookie.name) &&
                      formattedCookiesForStoring[i].includes(oldCookie.domain) &&
                          formattedCookiesForStoring[i].includes(oldCookie.path)
                      )
                    )
                      break
                  }
                }
                formattedCookiesForStoring.push(formattedCookie.toString())
              }
            }
          }
        }

        if (formattedCookiesForStoring.length > 0) {
          let packedFormattedCookies = formattedCookiesForStoring.join(', ')
          await SInfo.setItem(
            this.PACKED_COOKIES_NAME,
            packedFormattedCookies,
            {
              sharedPreferencesName: 'auth-prefs',
              keychainService: 'auth-chain',
            }
          )
        }
      }
    }
  }

  //   updateCookie(cookieName: string): void {
  //     throw new Error('Method not implemented.')
  //   }

  async deleteCookie(cookie: string): Promise<void> {
    let cookieName = this.getCookieName(cookie)

    await SInfo.deleteItem(cookieName, {
      sharedPreferencesName: 'auth-prefs',
      keychainService: 'auth-chain',
    })
  }

  checkCookieValidity(cookie: string): boolean {
    let splittedAttributes = cookie.split('; ')
    let expires = splittedAttributes.filter((element) =>
      element.includes('Expires')
    )
    if (expires.length === 0) return false
    let expiresDate = Date.parse(expires[0].split('=')[1])
    let currentDate = new Date().getTime()
    console.log(currentDate > expiresDate)

    if (currentDate > expiresDate) return false
    return true
  }

  async clear(): Promise<void> {
    for (let i = 0; i < this.COOKIES.length; i++) {
      await SInfo.deleteItem(this.COOKIES[i], {
        sharedPreferencesName: 'auth-prefs',
        keychainService: 'auth-chain',
      })
    }
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
