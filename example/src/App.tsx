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
        ".AspNetCore.Identity.Application=CfDJ8H8TfdxM8uBJs0K9kFh56Hp59t6qBD9ea75xe_-UxOAn9cQeeW1y92_kmJa-emYkS5bnsBnC7tmm27rUnQcDAzbz4PlMQ1Hx33ADkYoQRwIK0E7weSqcakLb9EkJNix5XrrjNBYlf__OivoqB7koqEYOzjW4OSxC14ItEMsmfb5e8aKYULlaIiHKdEW6MqtV28mKiYvbb03nqMkjdDB-zHSg8lpxUd9JDK2FP4VB09jPTWbVDnAQHaoM5in8VvJPt4RWHV3QUzIaEQJ9Vt_xpmM6MoZPn8ROdZiKjTG0t0xSVY1PZpyj5adpv8Xr6kBbzrBK3tLXBISxhE-sLQh6K7VNqvhefWLZmVG0EmhnfMn_xfYWLlXioIn_9AxHn-xvHgK_8OPzDp6u00yQCv128h5SDOd_lYEY8pLQoEjd5klJKVidELdTsExcXiNeB5dzbsFpH1oSsIAaH5HLeX2-dfqPG1l5qatOu79PWeC1x3KcUu58UJ3Z4XKp-a_F_HoW3qh7Qa719z-QIfXjfHkm3uw_Hc1_zUh8FwmITpluQC4O4mh4nz-2031klfPtEXGpHtUADW3-Ny4ymrfugqT4kxlmwcrKtg35Xx9Jl7-w5G1aoh9UOyJrzM4KkEyZPRB492EqpOHiFd5X6Cn70KINA8ZLxPCVKHBSYs9QXy-6E4HTTu_9ptV_n-IstaXIcsm2aA; expires=Mon, 21 Feb 2022 16:51:44 GMT; path=/; secure; samesite=lax; httponly",
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
