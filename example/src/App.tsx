import React, { useEffect, useState } from 'react'
import { View, FlatList, Text, StyleSheet } from 'react-native'
import { CookieManager } from 'react-native-cookie-parser'

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
  const cookieManager = new CookieManager()

  const [cookies, setCookies] = useState(false)
  useEffect(() => {
    let tstCookies = async () => {
      await cookieManager.insertCookiesFromHeader(
        "A=B; path=/; expires=2022-03-19T13:06:49Z; domain=devadmin.wiredent.ro; secure, C=Z; path=/, E=G; path=/",
        "https://devadmin.wiredent.ro/"
      )
      setCookies(true)
    }

    tstCookies()
  }, [])

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
