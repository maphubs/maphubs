import en from './en.json'
import fr from './fr.json'
import es from './es.json'
import it from './it.json'

const supportedLangs = {
  en,
  fr,
  es,
  it
}

export default {
  en,
  fr,
  es,
  it,

  getLocaleString: (locale, text) => {
    if (supportedLangs[locale] && supportedLangs[locale][text]) {
      return supportedLangs[locale][text]
    }
    return text
  }
}
