import PicaComic from '../picacomic'
import PicaComicError from '../error'

const debug = require('debug')('l2s:picacomic-api')

PicaComic.prototype.comics = async function (token, payload) {
  debug('请求获取漫画中...')
  try {
    const { data } = await this.req.get('/comics', {
      headers: { Authorization: token },
      params: payload
    })
    return data.data.comics
  } catch (e) {
    throw PicaComicError.capture(e)
  }
}
