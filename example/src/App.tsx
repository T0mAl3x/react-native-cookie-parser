import React, { useEffect, useState } from 'react'
import { View, FlatList, Text, StyleSheet } from 'react-native'
import { CookieManager, TokenManager } from 'react-native-cookie-parser'

const App = () => {
  const COOKIES = [
    ".ntedcy.sus",
    "ASP.NET_SessionId",
  ]
  const TOKENS = [
    "SubscriptionKey",
    "Token",
    "SiteID"
  ]
  const cookieManager = new CookieManager(COOKIES)

  const [cookies, setCookies] = useState(false)
  useEffect(() => {
    let tstCookies = async () => {
      await cookieManager.insertCookiesFromHeader(
        '.ntedcy.sus=en-US; Expires=Wed, 09 Jun 2021 10:18:14 GMT; ASP.NET_SessionId=31d4d96e407aad42; Path=/; Secure; HttpOnly'
      )
      setCookies(true)
    }

    tstCookies()
  }, [])

  useEffect(() => {
    let tstCookies = async () => {
      let test = await cookieManager.getConcatenatedCookies()
      console.log("tstCookies")
      console.log(test)
    }
    if (cookies) {
      console.log("merge")
      tstCookies()
    }
  }, [cookies])

  return <View style={styles.rootContainer}>
    <Text>Test</Text>
  </View>
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1
  }
})

export default App
