import { useDispatch, useSelector } from 'react-redux'
import { LocalizedString } from '../types/LocalizedString'
import Locales from '../services/locales'
import { LocaleState } from '../redux/reducers/locale'

type TranslateFunction = (v: string | LocalizedString) => string

export default function useT(): {
  t: TranslateFunction
  locale: string
  setLocale: (v: string) => void
} {
  const dispatch = useDispatch()
  const locale = useSelector(
    (state: { locale: LocaleState }) => state.locale.locale
  )

  const t = (val: LocalizedString | string) => {
    return typeof val === 'string'
      ? Locales.getLocaleString(locale, val)
      : Locales.getLocaleStringObject(locale, val)
  }
  const setLocale = (v: string) => {
    dispatch({ type: 'SET_LOCALE', locale: v })
  }
  return { t, locale, setLocale }
}
