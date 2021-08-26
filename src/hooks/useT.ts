import { useDispatch, useSelector } from '../redux/hooks'
import { LocalizedString } from '../types/LocalizedString'
import Locales from '../services/locales'
import { changeLocale, selectLocale } from '../redux/reducers/localeSlice'

type TranslateFunction = (v: string | LocalizedString) => string

export default function useT(): {
  t: TranslateFunction
  locale: string
  setLocale: (v: string) => void
} {
  const dispatch = useDispatch()
  const locale = useSelector(selectLocale)

  const t = (val: LocalizedString | string) => {
    return typeof val === 'string'
      ? Locales.getLocaleString(locale, val)
      : Locales.getLocaleStringObject(locale, val)
  }
  const setLocale = (v: string) => {
    dispatch(changeLocale(v))
  }
  return { t, locale, setLocale }
}
