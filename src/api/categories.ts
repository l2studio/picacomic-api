import PicaComic from '../picacomic'
import PicaComicError from '../error'

const debug = require('debug')('l2s:picacomic-api')

PicaComic.prototype.categories = async function (token) {
  debug('请求获取所有目录分类...')
  try {
    const { data } = await this.req.get('/categories', {
      headers: { Authorization: token }
    })
    return data.data.categories
  } catch (e) {
    throw PicaComicError.capture(e)
  }
}
