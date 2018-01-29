import React from 'react'

type Props = {|
  numPages: number,
  page: number,
  onClick: Function
|}

export default class PageSelect extends React.PureComponent<void, Props, void> {
  onClick = (page: number) => {
    this.props.onClick(page)
  }

  render () {
    const _this = this
    let leftArrowClass = 'waves-effect'
    let rightArrowClass = 'waves-effect'
    if (this.props.page === 1) {
      leftArrowClass = 'disabled'
    }
    if (this.props.page === this.props.numPages) {
      rightArrowClass = 'disabled'
    }

    const pages = []
    for (let i = 1; i <= this.props.numPages; i++) {
      pages.push(i)
    }

    const onClickPrev = () => {
      _this.onClick(this.props.page - 1)
    }

    const onClickNext = () => {
      _this.onClick(this.props.page + 1)
    }

    return (
      <ul className='pagination'>
        <li className={leftArrowClass}>
          <a href='#!' onClick={onClickPrev}>
            <i className='material-icons'>chevron_left</i>
          </a>
        </li>
        {
          pages.map(page => {
            const onClickFunc = () => {
              _this.onClick(page)
            }
            if (page === this.props.page) {
              return (
                <li className='active'><a href='#!' onClick={onClickFunc}>{page}</a></li>
              )
            } else {
              return (
                <li className='waves-effect'><a href='#!' onClick={onClickFunc}>{page}</a></li>
              )
            }
          })
        }
        <li className={rightArrowClass}>
          <a href='#!' onClick={onClickNext}>
            <i className='material-icons'>chevron_right</i>
          </a>
        </li>
      </ul>
    )
  }
}
