import en from './en.json'
import fr from './fr.json'
import es from './es.json'
import it from './it.json'

export default {
  en,
  fr,
  es,
  it,

  getLocaleString: (locale, text) => {
    if (this[locale] && this[locale][text]) {
      return this[locale][text]
    }
    return text
  }
}
