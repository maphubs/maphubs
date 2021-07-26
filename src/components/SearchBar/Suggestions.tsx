/*
From https://github.com/vakhtang/react-search-bar/
License: MIT
Modified to support antd and other customizations
*/
import React from 'react'

type Props = {
  suggestions: Array<{
    key: string
    value: string
  }>
  onSelection: (...args: Array<any>) => any
}
const Suggestions = ({ suggestions, onSelection }: Props): JSX.Element => {
  return (
    <>
      <style jsx>
        {`
          #dropdown-content {
            max-height: calc(100vh - 200px);
            background-color: #fff;
            margin: 0;
            width: 100%;
            overflow-y: auto;
            opacity: 1;
            position: absolute;
            left: 0;
            z-index: 9999;
            transform-origin: 0 0;
            box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
              0 3px 1px -2px rgba(0, 0, 0, 0.12), 0 1px 5px 0 rgba(0, 0, 0, 0.2);
          }

          .dropdown-content-item {
            clear: both;
            color: rgba(0, 0, 0, 0.87);
            cursor: pointer;
            min-height: 50px;
            line-height: 1.5rem;
            width: 100%;
            text-align: left;
          }

          .dropdown-content-item a {
            font-size: 16px;
            display: block;
            line-height: 22px;
            padding: 14px 16px;
          }

          .dropdown-content-item a:hover {
            color: #fff;
            background-color: ${process.env.NEXT_PUBLIC_PRIMARY_COLOR};
          }
        `}
      </style>
      <ul id='dropdown-content'>
        {suggestions.map((match, index) => {
          return (
            <li
              className='dropdown-content-item'
              key={match.key}
              onClick={(e) => {
                e.preventDefault() // needed since we listen a global click to hide the suggestions in SearchBar

                onSelection(match)
              }}
            >
              <a href='#!'>{match.value}</a>
            </li>
          )
        })}
      </ul>
    </>
  )
}
Suggestions.defaultProps = {
  suggestions: []
}
export default Suggestions
