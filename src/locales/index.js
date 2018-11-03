import en from './en.json'
import fr from './fr.json'
import es from './es.json'
import it from './it.json'
import pt from './pt.json'
import id from './id.json'

const supportedLangs = {
  en,
  fr,
  es,
  it,
  pt,
  id
}

export default {
  en,
  fr,
  es,
  it,
  pt,
  id,
  getLocaleString: (locale, text) => {
    if (supportedLangs[locale] && supportedLangs[locale][text]) {
      return supportedLangs[locale][text]
    }
    return text
  }
}
