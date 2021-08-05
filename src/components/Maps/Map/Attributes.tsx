import React from 'react'

type Props = {
  attributes: Record<string, any>
  t: (v: string) => string
}

const Attributes = ({ t, attributes }: Props): JSX.Element => {
  const spacer = (
    <div
      style={{
        height: '50px'
      }}
    />
  )
  let display = <></>

  if (attributes && Object.keys(attributes).length > 0) {
    let presets

    if (attributes.maphubs_metadata && attributes.maphubs_metadata.presets) {
      presets = attributes.maphubs_metadata.presets
    }

    display =
      presets && Array.isArray(presets) && presets.length > 0 ? (
        <ul
          className='collection'
          style={{
            marginTop: 0
          }}
        >
          {presets.map((preset) => {
            if (
              typeof preset.showOnMap !== 'undefined' &&
              preset.showOnMap === false
            )
              return ''
            let val = attributes[preset.tag]
            if (!val || (typeof val === 'string' && val === 'null')) return ''

            if (typeof val === 'string' && val.startsWith('http')) {
              val = (
                <a target='_blank' rel='noopener noreferrer' href={val}>
                  {val}
                </a>
              )
            }

            return (
              <li
                key={preset.tag}
                style={{
                  paddingLeft: '5px',
                  paddingRight: '5px',
                  paddingTop: 0,
                  paddingBottom: 0,
                  lineHeight: '14px',
                  borderBottom: '1px solid #ddd'
                }}
                className='collection-item attribute-collection-item'
              >
                <p
                  style={{
                    color: 'rgb(158, 158, 158)',
                    fontSize: '9px'
                  }}
                >
                  {t(preset.label)}
                </p>
                <p
                  className='word-wrap'
                  style={{
                    fontSize: '11px'
                  }}
                >
                  {val}
                </p>
              </li>
            )
          })}
        </ul>
      ) : (
        <ul
          className='collection'
          style={{
            marginTop: 0
          }}
        >
          {Object.keys(attributes).map((key) => {
            if (
              key !== 'mhid' &&
              key !== 'layer_id' &&
              key !== 'maphubs_metadata' &&
              key !== 'maphubs_host'
            ) {
              let val = attributes[key]

              if (!val) {
                return ''
              }

              if (typeof val !== 'string') {
                val = val.toString()
              }

              if (typeof val === 'string' && val.startsWith('http')) {
                val = (
                  <a target='_blank' rel='noopener noreferrer' href={val}>
                    {val}
                  </a>
                )
              }

              return (
                <li
                  key={key}
                  style={{
                    padding: 5,
                    lineHeight: '14px',
                    borderBottom: '1px solid #ddd'
                  }}
                  className='collection-item attribute-collection-item'
                >
                  <p
                    style={{
                      color: 'rgb(158, 158, 158)',
                      fontSize: '9px'
                    }}
                  >
                    {key}
                  </p>
                  <p
                    className='word-wrap'
                    style={{
                      fontSize: '11px'
                    }}
                  >
                    {val}
                  </p>
                </li>
              )
            }
          })}
        </ul>
      )
  }

  return (
    <div
      style={{
        width: '100%',
        overflowY: 'auto',
        height: '100%',
        borderTop: '1px solid #DDD'
      }}
    >
      <style jsx global>
        {`
          .word-wrap {
            overflow-wrap: break-word;
            word-wrap: break-word;
            -ms-word-break: break-all;
            word-break: break-word;
            -ms-hyphens: auto;
            -moz-hyphens: auto;
            -webkit-hyphens: auto;
            hyphens: auto;
          }
        `}
      </style>
      {display}
      {spacer}
    </div>
  )
}
export default Attributes
