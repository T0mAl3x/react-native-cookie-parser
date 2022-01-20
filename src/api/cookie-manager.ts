import SInfo from 'react-native-sensitive-info'

interface RNCookieParserProps {
  getConcatenatedCookies(): Promise<string | null>
  parseCookiesFromHeader(cookiesHeader: string): string[]
  getCookieName(cookie: string): string
  insertCookiesFromHeader(setCookieHeader: string): Promise<void>
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
  COOKIES: string[] = []

  constructor(cookieKeys: string[]) {
    this.COOKIES = [...cookieKeys]
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

  parseCookiesFromHeader(cookiesHeader: string): string[] {
    const parsed: queryString.ParsedUrl = queryString.parseUrl(
      'https://pokeapi.co/api/v2/pokemon?offset=10&limit=10'
    )
    console.log(parsed)
    let headers = cookiesHeader.split('; ')
    let cookies = []

    let cookie = ''
    headers.forEach((element, index) => {
      if (this.COOKIES.some((cookieKey) => element.includes(cookieKey))) {
        if (cookie !== '') {
          cookies.push(cookie)
          cookie = ''
          if (index > 0) cookie = cookie + element + '; '
        } else {
          cookie = cookie + element + '; '
        }
      } else if (/domain/.test(element.toLowerCase())) {
        cookie = cookie + element.replace('domain', 'Domain') + '; '
      } else if (/path/.test(element.toLowerCase())) {
        cookie = cookie + element.replace('path', 'Path') + '; '
      } else if (/expires/.test(element.toLowerCase())) {
        cookie = cookie + element.replace('expires', 'Expires') + '; '
      } else if (/size/.test(element.toLowerCase())) {
        cookie = cookie + element.replace('size', 'Size') + '; '
      } else if (/httponly/.test(element.toLowerCase())) {
        cookie = cookie + element.replace('httponly', 'HttpOnly') + '; '
      } else if (/secure/.test(element.toLowerCase())) {
        cookie = cookie + element.replace('secure', 'Secure') + '; '
      } else if (/samesite/.test(element.toLowerCase())) {
        cookie = cookie + element.replace('samesite', 'SameSite') + '; '
      } else if (/priority/.test(element.toLowerCase())) {
        cookie = cookie + element.replace('priority', 'Priority') + '; '
      }
    })
    if (cookie !== '') {
      cookies.push(cookie)
    }

    return cookies
  }

  getCookieName(cookie: string): string {
    let nameValuePair = cookie.split('; ')[0]
    let cookieName = nameValuePair.split('=')[0]
    return cookieName
  }

  async insertCookiesFromHeader(setCookieHeader: string): Promise<void> {
    if (setCookieHeader) {
      let cookies = this.parseCookiesFromHeader(setCookieHeader)
      if (cookies.length > 0) {
        for (let i = 0; i < cookies.length; i++) {
          if (this.checkCookieValidity(cookies[i])) {
            await SInfo.setItem(this.getCookieName(cookies[i]), cookies[i], {
              sharedPreferencesName: 'auth-prefs',
              keychainService: 'auth-chain',
            })
          }
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
