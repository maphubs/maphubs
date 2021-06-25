import locales from '../locales'
import localeUtil from '../locales/util'
const i18n = null
/*
if (process.env.APP_ENV !== 'browser') {
  i18n = require('../i18n')
}
*/

export default {
  en: locales.en,
  fr: locales.fr,
  es: locales.es,
  it: locales.it,
  id: locales.id,
  pt: locales.pt,

  getLocaleString(locale, text) {
    if (i18n) {
      // use i18n package when running on the server
      i18n.setLocale(locale)
      return i18n.__(text)
    } else {
      return locales.getLocaleString(locale, text)
    }
  },

  formModelToLocalizedString(model, name) {
    const result = localeUtil.getEmptyLocalizedString()
    Object.keys(result).forEach((key) => {
      if (model[`${name}-${key}`]) {
        result[key] = model[`${name}-${key}`]
      }
    })
    return result
  },

  getFirstNonEmptyString(localizedString) {
    let result = ''
    Object.keys(localizedString).forEach((key) => {
      const val = localizedString[key]
      if (val) result = val
    })
    return result
  },

  getLocaleStringObject(locale, localizedString) {
    // recover if given an undefined localizedString
    if (!localizedString) {
      return localizedString
    }

    // recover if we somehow end up with a plain string
    if (typeof localizedString === 'string') {
      return localizedString
    }

    if (locale) {
      if (localizedString[locale]) {
        // found the requested locale
        return localizedString[locale]
      } else {
        if (localizedString.en) {
          // default to English if avaliable
          return localizedString.en
        } else {
          // didn't find requested locale or english, so trying to return something
          return this.getFirstNonEmptyString(localizedString)
        }
      }
    } else {
      if (localizedString.en) {
        // default to English if avaliable
        return localizedString.en
      } else {
        // didn't find requested locale or english, so trying to return something
        return this.getFirstNonEmptyString(localizedString)
      }
    }
  }
}