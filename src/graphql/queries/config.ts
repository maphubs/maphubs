import PageModel from '../../models/page'

export default {
  async pageConfig(): Promise<Record<string, unknown>> {
    return PageModel.getPageConfigs(['header', 'footer'])
  },
  async mapConfig(): Promise<Record<string, unknown>> {
    const result = await PageModel.getPageConfigs(['map'])
    return result[0]
  },
  async homeConfig(): Promise<Record<string, unknown>> {
    const result = await PageModel.getPageConfigs(['home'])
    return result[0]
  }
}
