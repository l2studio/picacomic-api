import PicaComic from '../picacomic'
import PicaComicError from '../error'

const debug = require('debug')('l2s:picacomic-api')

PicaComic.prototype.signIn = async function (email, password) {
  debug('请求使用 \'%s\' 进行登录认证...', email)
  try {
    const { data } = await this.req.post('/auth/sign-in', { email, password }, {
      headers: { 'content-type': 'application/json; charset=UTF-8' }
    })
    return data.data.token
  } catch (e) {
    throw PicaComicError.capture(e)
  }
}
