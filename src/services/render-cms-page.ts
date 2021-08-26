import Layer from '../models/layer'
import Group from '../models/group'
import Map from '../models/map'
import Story from '../models/story'
import pageOptions from './page-options-helper'
import { Layer as LayerType } from '../types/layer'
import { Story as StoryType } from '../types/story'
import { Group as GroupType } from '../types/group'

export default async function (
  app: any,
  config: Record<string, any>,
  req: any,
  res: any
): Promise<unknown> {
  const results: {
    map?: any
    layers?: LayerType[]
    featuredLayers?: LayerType[]
    popularLayers?: LayerType[]
    recentLayers?: LayerType[]
    featuredStories?: StoryType[]
    recentStories?: StoryType[]
    featuredGroups?: GroupType[]
    recentGroups?: GroupType[]
    featuredMaps?: any[]
    recentMaps?: any[]
  } = {}

  // use page config to determine data requests
  if (
    config.components &&
    Array.isArray(config.components) &&
    config.components.length > 0
  ) {
    await Promise.all(
      config.components.map(async (component: Record<string, any>) => {
        switch (component.type) {
          case 'map': {
            results.map = await Map.getMap(component.map_id)
            results.layers = await Map.getMapLayers(component.map_id, false)

            break
          }
          case 'storyfeed': {
            if (component.datasets) {
              await Promise.all(
                component.datasets.map(async (dataset) => {
                  const { type, max, tags } = dataset
                  const number = max || 6

                  switch (type) {
                    case 'featured': {
                      results.featuredStories = await Story.getFeaturedStories(
                        number
                      )

                      break
                    }
                    case 'recent': {
                      results.recentStories = await Story.getRecentStories({
                        number,
                        tags
                      })

                      break
                    }
                    // No default
                  }
                })
              )
            } else {
              results.featuredStories = await Story.getFeaturedStories(5)
            }

            break
          }
          case 'carousel': {
            if (
              component.datasets &&
              Array.isArray(component.datasets) &&
              component.datasets.length > 0
            ) {
              await Promise.all(
                component.datasets.map(async (dataset) => {
                  const { type, filter, max, tags } = dataset
                  const number = max || 6

                  switch (type) {
                    case 'layer': {
                      switch (filter) {
                        case 'featured': {
                          results.featuredLayers =
                            await Layer.getFeaturedLayers(number)

                          break
                        }
                        case 'popular': {
                          results.popularLayers = await Layer.getPopularLayers(
                            number
                          )

                          break
                        }
                        case 'recent': {
                          results.recentLayers = await Layer.getRecentLayers(
                            number
                          )

                          break
                        }
                        // No default
                      }

                      break
                    }
                    case 'group': {
                      switch (filter) {
                        case 'featured': {
                          results.featuredGroups =
                            await Group.getFeaturedGroups(number)

                          break
                        }
                        case 'recent': {
                          results.recentGroups = await Group.getRecentGroups(
                            number
                          )

                          break
                        }
                        // No default
                      }

                      break
                    }
                    case 'map': {
                      switch (filter) {
                        case 'featured': {
                          results.featuredMaps = await Map.getFeaturedMaps(
                            number
                          )

                          break
                        }
                        case 'recent': {
                          results.recentMaps = await Map.getRecentMaps(number)

                          break
                        }
                        // No default
                      }

                      break
                    }
                    case 'story': {
                      switch (filter) {
                        case 'featured': {
                          results.featuredStories =
                            await Story.getFeaturedStories(number)

                          break
                        }
                        case 'recent': {
                          results.recentStories = await Story.getRecentStories({
                            number,
                            tags
                          })

                          break
                        }
                        // No default
                      }

                      break
                    }
                    // No default
                  }
                })
              )
            }

            break
          }
          // No default
        }
      })
    )
  }

  const props = { ...results, pageConfig: config }
  let title = process.env.NEXT_PUBLIC_PRODUCT_NAME
  let description = process.env.NEXT_PUBLIC_PRODUCT_NAME

  if (config.title && config.title[req.locale]) {
    title = config.title[req.locale]
  } else if (config.title && config.title.en) {
    title = config.title.en
  }

  if (config.description && config.description[req.locale]) {
    description = config.description[req.locale]
  } else if (config.description && config.description.en) {
    description = config.description.en
  }

  return app.next.render(
    req,
    res,
    '/home',
    await pageOptions(req, {
      title,
      description,
      props
    })
  )
}
