This library is a basic cookie parser which uses the algorithms defined in RFC 6265.

### **External dependencies**
[react-native-sensitive-info](https://github.com/mcodex/react-native-sensitive-info) is used as the storage manager

[react-native-url-polyfill
](https://github.com/charpeni/react-native-url-polyfill) is used to parse URLs

### **Install**
`yarn add react-native-cookie-parser`

`npm install react-native-cookie-parser`

### **Usage**
    import { CookieManager } from 'react-native-cookie-parser'

    const cookieManager = new CookieManager()

    // Recommended to use inside a response interceptor
    await cookieManager.insertCookiesFromHeader(
        "A=B; path=/; expires=2022-03-11T13:06:49Z; domain=example.ro; secure, C=Z; path=/; secure, E=G; path=/", 
        "https://example.ro/"
    )

    // Fetches cookies from store
    // Format -> A=B; C=Z; E=G
    let cookies = await cookieManager.getConcatenatedCookies(
        "https://example.ro/"
    )

    // Clear store (usually on logout)
    await cookieManager.clear()

On every insert/get the expired cookies are removed

If you want to store additional tokens you can use TokenManager

    import { TokenManager } from 'react-native-cookie-parser'

    const tokenManager = new TokenManager()

    await tokenManager.setAuthTokens({"a": "b", "c": "d", "e": "f"})
    let tokens = await tokenManager.getAuthTokens()

    // Clear store
    await tokenManager.wipeAuthTokens()