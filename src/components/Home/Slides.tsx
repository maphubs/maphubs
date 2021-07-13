import React from 'react'
import { Button, Carousel } from 'antd'
import useT from '../../hooks/useT'

type SlideConfig = {
  img: string
  title: string
  text: string
  link: string
  buttonText: string
}

type Props = {
  config: { slides: SlideConfig[] }
}

const Slides = ({ config }: Props): JSX.Element => {
  const { t } = useT()
  if (!config?.slides) return <></>
  return (
    <>
      <style jsx global>
        {`
          .ant-carousel {
            width: 100vw;
          }
          .ant-carousel .slick-slide {
            text-align: center;
            line-height: 160px;
            overflow: hidden;
          }
          .slide-text {
            text-align: left;
            display: block;
            margin-left: 5%;
            max-width: 80%;
            padding: 0;
            bottom: auto;
            width: auto;
            background: none;
          }

          .slide-text h2 {
            background: rgba(0, 0, 0, 0.55);
            font-size: 61px;
            padding: 10px 5px 5px;
            color: rgba(255, 255, 255, 0.85);
            border: none;
            font-weight: 400;
            text-transform: uppercase;
          }

          .slide-text h3 {
            display: inline-block;
            float: left;
            clear: both;
            background: rgba(0, 0, 0, 0.55);
            font-size: 31px;
            padding: 5px;
            overflow: hidden;
            color: rgba(255, 255, 255, 0.85);
            border: none;
            text-transform: uppercase;
            font-weight: 300;
          }

          .slide-button {
            position: absolute;
            width: 100vw;
            text-align: center;
            bottom: -5px;
          }
          @media only screen and (max-width: 480px) {
            .slide-text h2 {
              font-size: 40px;
            }

            .slide-text h3 {
              font-size: 20px;
            }
          }
        `}
      </style>
      <Carousel autoplay pauseOnFocus pauseOnDotsHover>
        {config.slides.map((slide, i) => {
          return (
            <div key={i}>
              <div
                key={i}
                className='valign-wrapper'
                style={{
                  height: '500px',
                  backgroundSize: 'cover',
                  backgroundImage: 'url(' + slide.img + ')'
                }}
              >
                <div className='slide-text'>
                  <h2 className='no-margin'>{t(slide.title)}</h2>
                  <h3 className='no-margin'>{t(slide.text)}</h3>
                </div>
                <div className='slide-button'>
                  <Button type='primary' size='large' href={slide.link}>
                    {t(slide.buttonText)}
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </Carousel>
    </>
  )
}
export default Slides
