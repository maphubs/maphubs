import React from 'react'
import Link from 'next/link'
import { Tooltip } from 'antd'
import Search from '@material-ui/icons/Search'
import useT from '../../hooks/useT'
type Props = {
  searchLink: string
}

const SearchButton = ({ searchLink }: Props): JSX.Element => {
  const { t } = useT()
  return (
    <Tooltip title={t('Search')} placement='bottom'>
      <Link href={searchLink}>
        <a
          style={{
            paddingTop: '7px',
            height: '50px',
            textAlign: 'center'
          }}
        >
          <Search
            style={{
              fill: 'currentColor',
              width: '1em',
              height: '1em',
              display: 'inline-block',
              fontSize: '24px'
            }}
          />
        </a>
      </Link>
    </Tooltip>
  )
}
export default SearchButton
