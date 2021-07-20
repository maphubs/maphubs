export type LocaleState = {
  locale?: string
}

const initialLocaleState = {
  locale: 'en'
}

const locale = (
  state: LocaleState = initialLocaleState,
  action: { type: 'SET_LOCALE'; locale: string }
): any => {
  switch (action.type) {
    case 'SET_LOCALE':
      return action.locale
        ? {
            ...state,
            locale: action.locale
          }
        : { ...state }

    default:
      return state
  }
}

export { initialLocaleState }
export default locale
