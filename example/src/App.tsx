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
  const cookieManager = new CookieManager()
  const tokenManager = new TokenManager()

  // const [cookies, setCookies] = useState(false)
  const [tokens, setTokens] = useState(false)
  // useEffect(() => {
  //   let tstCookies = async () => {
  //     await cookieManager.insertCookiesFromHeader(
  //       "A=B; path=/; expires=2022-03-11T13:06:49Z; domain=devadmin.wiredent.ro; secure, C=Z; path=/; secure, E=G; path=/",
  //       "https://devadmin.wiredent.ro/"
  //     )
  //     setCookies(true)
  //   }

  //   tstCookies()
  // }, [])

  // useEffect(() => {
  //   let tstCookies = async () => {
  //     let cookies = await cookieManager.getConcatenatedCookies(
  //       "https://devadmin.wiredent.ro/"
  //     )
  //   }
    
  //   if (cookies === true)
  //     // setTimeout(() => {
  //     //   tstCookies()
  //     // }, 1000)
  //     tstCookies()
      
  // }, [cookies])

  useEffect(() => {
    let tstCookies = async () => {
      await tokenManager.setAuthTokens({"a": "b", "c": "d", "e": "f"})
      setTokens(true)
    }

    tstCookies()
  }, [])

  useEffect(() => {
    let tstCookies = async () => {
      let cookies = await tokenManager.getAuthTokens()
      console.log(cookies)
    }
    
    if (tokens === true)
      // setTimeout(() => {
      //   tstCookies()
      // }, 1000)
      tstCookies()
      
  }, [tokens])

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
