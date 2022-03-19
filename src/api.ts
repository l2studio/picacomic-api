import type * as types from './type'
import type { Duplex } from 'stream'
import { httpOverHttp, httpsOverHttp } from 'tunnel'
import { v4 as uuidv4 } from 'uuid'
import { createHmac } from 'crypto'
import got, { HTTPError } from 'got'
import { isPromise } from './util'

const debug = require('debug')('lgou2w:picacomic-api')

export type Options = {
  timeout?: number
  proxy?: {
    host: string
    port: number
  }
  app: {
    api: string
    apiKey: string
    signatureKey: string
    accept: string
    channel: '1' | '2' | '3'
    version: string
    uuid: string
    platform: string
    buildVersion: string
    userAgent: string
    imageQuality: 'original' | 'low' | 'medium' | 'high'
  }
  // eslint-disable-next-line no-use-before-define
  reauthorizationTokenCallback?: (self: PicaComicAPI) => string | undefined | Promise<string | undefined>
}

const DEFAULT_OPTION_APP: Options['app'] = {
  api: 'https://picaapi.picacomic.com/',
  apiKey: 'C69BAF41DA5ABD1FFEDC6D2FEA56B',
  signatureKey: '~d}$Q7$eIni=V)9\\RK/P.RM4;9[7|@/CA}b~OW!3?EV`:<>M7pddUBL5n|0/*Cn',
  accept: 'application/vnd.picacomic.com.v1+json',
  channel: '2',
  version: '2.2.1.2.3.3',
  uuid: 'defaultUuid',
  platform: 'android',
  buildVersion: '44',
  userAgent: 'okhttp/3.8.1',
  imageQuality: 'original'
}

function mergeOptions (opts: Partial<Options>): Options {
  const result: any = { ...opts }
  mergeObjectProperty(result, DEFAULT_OPTION_APP, 'app')
  return result
}

function mergeObjectProperty (src: any, value: any, property: string) {
  if (!src[property]) src[property] = value
  else for (const key in value) src[property][key] = value[key]
}

function makeAuthorizationHeaders (token: string) {
  return { authorization: token }
}

type Response<T> = {
  code: number
  message: string
  data: T
}

export class PicaComicError extends Error {
  constructor (
    readonly cause: HTTPError | Error,
    readonly code: number,
    readonly error: string,
    readonly message: string,
    readonly detail?: string
  ) {
    super(message)
    this.name = 'PicaComicError'
  }
}

function catchError (err: HTTPError | Error): Promise<never> {
  let wrap: PicaComicError
  if (err instanceof HTTPError && err.response.body) {
    const { code, error, message, detail } = JSON.parse(err.response.body as string)
    wrap = new PicaComicError(err, code, error, message, detail)
  } else {
    wrap = new PicaComicError(err, -1, 'Error', err.message)
  }
  Error.captureStackTrace(wrap, catchError)
  return Promise.reject(wrap)
}

export class PicaComicAPI {
  public readonly fetch: typeof got
  public readonly options: Readonly<Options>

  constructor (opts?: Partial<Options>) {
    opts = opts || {}
    this.options = mergeOptions(opts)
    this.fetch = got.extend({
      prefixUrl: this.options.app.api,
      maxRedirects: 0,
      followRedirect: false,
      timeout: opts.timeout,
      retry: 0,
      agent: opts.proxy
        ? {
            http: httpOverHttp({ proxy: opts.proxy }),
            https: httpsOverHttp({ proxy: opts.proxy }) as any
          }
        : undefined,
      hooks: {
        beforeRequest: [
          options => {
            if (options.context.fetchImage) return // skip image fetch
            const url = options.url.toString()
            const method = options.method
            debug('FETCH -> %s %s', method, url)
            const {
              api, apiKey, signatureKey,
              channel, version, uuid, platform, buildVersion,
              accept, userAgent, imageQuality
            } = this.options.app
            const nonce = uuidv4().replace(/-/g, '')
            const time = (Date.now() / 1000).toFixed(0)
            const con = (
              (url.charAt(0) === '/' ? url.substring(1) : url).replace(api, '') +
              time + nonce + method + apiKey
            ).toLowerCase()
            const signature = createHmac('sha256', signatureKey).update(con).digest().toString('hex')
            options.headers['content-type'] === 'application/json' && (options.headers['content-type'] = 'application/json; charset=UTF-8')
            mergeObjectProperty(options, {
              time,
              nonce,
              accept,
              signature,
              'api-key': apiKey,
              'app-channel': channel,
              'app-version': version,
              'app-uuid': uuid,
              'app-platform': platform,
              'app-build-version': buildVersion,
              'user-agent': userAgent,
              'image-quality': imageQuality
            }, 'headers')
          }
        ],
        afterResponse: [
          async (response, retryWithMergedOptions) => {
            if (response.statusCode !== 401) return response
            if (typeof this.options.reauthorizationTokenCallback !== 'function') return response
            debug('REAUTHORIZATION TOKEN')
            let token = this.options.reauthorizationTokenCallback(this)
            isPromise(token) && (token = await token)
            if (!token) return response
            const updatedOptions = { headers: makeAuthorizationHeaders(token) }
            return retryWithMergedOptions(updatedOptions)
          }
        ]
      }
    })
  }

  async register (payload: {
    name: string
    email: string
    password: string
    question1: string
    question2: string
    question3: string
    answer1: string
    answer2: string
    answer3: string
    birthday: string | Date | number
    gender: 'm' | 'f' | 'bot'
  }): Promise<Response<void>> {
    if (payload.birthday instanceof Date) {
      payload.birthday = payload.birthday.valueOf()
    }
    return this.fetch
      .post('auth/register', { json: payload })
      .json<Response<void>>()
      .catch(catchError)
  }

  async signIn (payload: { email: string, password: string }): Promise<string> {
    return this.fetch
      .post('auth/sign-in', {
        json: {
          email: payload.email,
          password: payload.password
        }
      })
      .json<Response<{ token: string }>>()
      .then(res => res.data.token)
      .catch(catchError)
  }

  async punchIn (payload: { token: string }): Promise<types.PunchInResponse> {
    return this.fetch
      .post('users/punch-in', { headers: makeAuthorizationHeaders(payload.token) })
      .json<Response<{ res: types.PunchInResponse }>>()
      .then(res => res.data.res)
      .catch(catchError)
  }

  async fetchUserProfile (payload: { token: string }): Promise<types.User> {
    return this.fetch
      .get('users/profile', { headers: makeAuthorizationHeaders(payload.token) })
      .json<Response<{ user: types.User }>>()
      .then(res => res.data.user)
      .catch(catchError)
  }

  async fetchUserFavourite (payload: { token: string, page?: number, sort?: types.ComicSort }): Promise<types.Comics> {
    return this.fetch
      .get('users/favourite', {
        headers: makeAuthorizationHeaders(payload.token),
        searchParams: {
          page: payload.page || 1,
          s: payload.sort || 'ua'
        }
      })
      .json<Response<{ comics: types.Comics }>>()
      .then(res => res.data.comics)
      .catch(catchError)
  }

  async fetchCategories (payload: { token: string }): Promise<types.Category[]> {
    return this.fetch
      .get('categories', { headers: makeAuthorizationHeaders(payload.token) })
      .json<Response<{ categories: types.Category[] }>>()
      .then(res => res.data.categories)
      .catch(catchError)
  }

  async fetchComics (payload: { token: string, category: string, page?: number, sort?: types.ComicSort }): Promise<types.Comics> {
    return this.fetch
      .get('comics', {
        headers: makeAuthorizationHeaders(payload.token),
        searchParams: {
          c: payload.category,
          page: payload.page || 1,
          s: payload.sort || 'ua'
        }
      })
      .json<Response<{ comics: types.Comics }>>()
      .then(res => res.data.comics)
      .catch(catchError)
  }

  async fetchComic (payload: { token: string, id: string }): Promise<types.ComicInfo> {
    return this.fetch
      .get(`comics/${payload.id}`, { headers: makeAuthorizationHeaders(payload.token) })
      .json<Response<{ comic: types.ComicInfo }>>()
      .then(res => res.data.comic)
      .catch(catchError)
  }

  async fetchComicComments (payload: { token: string, comicId: string, page?: number }): Promise<types.ComicComments> {
    return this.fetch
      .get(`comics/${payload.comicId}/comments`, {
        headers: makeAuthorizationHeaders(payload.token),
        searchParams: {
          page: payload.page || 1
        }
      })
      .json<Response<{ comments: types.Paginate<types.ComicComment[]>, topComments: types.ComicComment[] }>>()
      .then(res => res.data)
      .catch(catchError)
  }

  async fetchComicEpisodes (payload: { token: string, comicId: string, page?: number }): Promise<types.ComicEpisodes> {
    return this.fetch
      .get(`comics/${payload.comicId}/eps`, {
        headers: makeAuthorizationHeaders(payload.token),
        searchParams: {
          page: payload.page || 1
        }
      })
      .json<Response<{ eps: types.ComicEpisodes }>>()
      .then(res => res.data.eps)
      .catch(catchError)
  }

  async fetchComicEpisodePages (payload: { token: string, comicId: string, epsOrder: number, page?: number }): Promise<types.ComicEpisodePages> {
    return this.fetch
      .get(`comics/${payload.comicId}/order/${payload.epsOrder}/pages`, {
        headers: makeAuthorizationHeaders(payload.token),
        searchParams: {
          page: payload.page || 1
        }
      })
      .json<Response<types.ComicEpisodePages>>()
      .then(res => res.data)
      .catch(catchError)
  }

  stringifyImageUrl (image: { path: string, fileServer?: string }): string {
    let { path, fileServer } = image

    if (path.startsWith('tobeimg/')) {
      fileServer = fileServer || 'https://img.picacomic.com'
      path = '/' + path.substring(8)
    } else if (path.startsWith('tobs/')) {
      fileServer = fileServer || 'https://storage-b.picacomic.com'
      path = '/static/' + path.substring(5)
    } else {
      fileServer = fileServer || 'https://storage1.picacomic.com'
      path = '/static/' + path
    }
    return fileServer.replace(/\/$/, '') + path
  }

  async fetchImage (image: { path: string, fileServer?: string }): Promise<Duplex> {
    const url = this.stringifyImageUrl(image)
    return this.fetch.stream({ prefixUrl: '', url, context: { fetchImage: true } })
  }

  async search (payload: {
    token: string
    keyword: string
    categories?: string[]
    page?: number
    sort?: types.ComicSort
  }): Promise<types.Comics> {
    return this.fetch
      .post('comics/advanced-search', {
        headers: makeAuthorizationHeaders(payload.token),
        searchParams: { page: payload.page || 1 },
        json: {
          keyword: payload.keyword,
          categories: payload.categories,
          s: payload.sort || 'ua'
        }
      })
      .json<Response<{ comics: types.Comics }>>()
      .then(res => res.data.comics)
      .catch(catchError)
  }

  async switchComicLike (payload: { token: string, id: string }): Promise<'like' | 'unlike'> {
    return this.fetch
      .post(`comics/${payload.id}/like`, { headers: makeAuthorizationHeaders(payload.token) })
      .json<Response<{ action: 'like' | 'unlike' }>>()
      .then(res => res.data.action)
      .catch(catchError)
  }

  async switchComicFavourite (payload: { token: string, id: string }): Promise<'favourite' | 'un_favourite'> {
    return this.fetch
      .post(`comics/${payload.id}/favourite`, { headers: makeAuthorizationHeaders(payload.token) })
      .json<Response<{ action: 'favourite' | 'un_favourite' }>>()
      .then(res => res.data.action)
      .catch(catchError)
  }

  async setUserProfileSlogan (payload: { token: string, slogan: string }): Promise<Response<void>> {
    return this.fetch
      .put('users/profile', {
        headers: makeAuthorizationHeaders(payload.token),
        json: {
          slogan: payload.slogan
        }
      })
      .json<Response<void>>()
      .catch(catchError)
  }
}
