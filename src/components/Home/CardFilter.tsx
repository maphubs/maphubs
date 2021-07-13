import React from 'react'
import useT from '../../hooks/useT'

type Props = {
  value: string
  onChange: (value: string) => void
}

const CardFilter = ({ value, onChange }: Props): JSX.Element => {
  const { t } = useT()
  return (
    <div
      className='valign right-align'
      style={{
        width: '100%'
      }}
    >
      <span
        className={value === 'featured' ? 'omh-accent-text' : ''}
        onClick={() => {
          onChange('featured')
        }}
        style={{
          cursor: 'pointer'
        }}
      >
        {t('Featured')}
      </span>{' '}
      |&nbsp;
      <span
        className={value === 'popular' ? 'omh-accent-text' : ''}
        onClick={() => {
          onChange('popular')
        }}
        style={{
          cursor: 'pointer'
        }}
      >
        {t('Popular')}
      </span>{' '}
      |&nbsp;
      <span
        className={value === 'recent' ? 'omh-accent-text' : ''}
        onClick={() => {
          onChange('recent')
        }}
        style={{
          cursor: 'pointer'
        }}
      >
        {t('Recent')}
      </span>
    </div>
  )
}
export default CardFilter
