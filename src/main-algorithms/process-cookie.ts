export const processExpiresAttribute = (attributeValue: string) => {
  /*
    Let the expiry-time be the result of parsing the attribute-value as
    cookie-date.
  */
  let expiryTime = Date.parse(attributeValue)

  /*
    If the attribute-value failed to parse as a cookie date, ignore the
    cookie-av.
  */
  if (isNaN(expiryTime)) return null

  return new Date(expiryTime)
}

export const processMaxAgeAttribute = (attributeValue: string) => {
  /*
    If the first character of the attribute-value is not a DIGIT or a "-"
    character, ignore the cookie-av.
   */
  if (
    attributeValue === '' ||
    (attributeValue[0] !== '-' && isNaN(parseInt(attributeValue[0], 10)))
  )
    return null

  /*
    If the remainder of attribute-value contains a non-DIGIT character,
    ignore the cookie-av.
  */
  let attributeValueRemainder = attributeValue.substring(
    1,
    attributeValue.length
  )
  for (let i = 0; i < attributeValueRemainder.length; i++) {
    if (isNaN(parseInt(attributeValueRemainder[i], 10))) return null
  }

  /*
    Let delta-seconds be the attribute-value converted to an integer.
  */
  let deltaSeconds = parseInt(attributeValue, 10)

  /*
    If delta-seconds is less than or equal to zero (0), let expiry-time
    be the earliest representable date and time.  Otherwise, let the
    expiry-time be the current date and time plus delta-seconds seconds.
  */
  if (deltaSeconds <= 0) {
    return new Date(-8640000000000000)
  } else {
    let currentTime = new Date()
    currentTime.setSeconds(currentTime.getSeconds() + deltaSeconds)
    return currentTime
  }
}

export const processDomainAttribute = (attributeValue: string) => {
  /*
    If the attribute-value is empty, the behavior is undefined.  However,
    the user agent SHOULD ignore the cookie-av entirely.
  */
  if (attributeValue === '') return null

  /*
    If the first character of the attribute-value string is %x2E ("."):

      Let cookie-domain be the attribute-value without the leading %x2E
      (".") character.

    Otherwise:

      Let cookie-domain be the entire attribute-value.

    Convert the cookie-domain to lower case.
  */
  if (attributeValue[0] === '.') {
    return attributeValue.substring(1, attributeValue.length).toLowerCase()
  } else {
    return attributeValue.toLowerCase()
  }
}

export const processPathAttribute = (attributeValue: string) => {
  /*
    If the attribute-value is empty or if the first character of the
    attribute-value is not %x2F ("/"):

      Let cookie-path be the default-path.

    Otherwise:

      Let cookie-path be the attribute-value.
  */
  if (attributeValue === '' || attributeValue[0] !== '/') {
    return '/'
  } else {
    return attributeValue
  }
}
