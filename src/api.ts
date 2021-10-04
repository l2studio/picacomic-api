import type * as types from './type'
import type { Duplex } from 'stream'
import { httpOverHttp, httpsOverHttp } from 'tunnel'
import { v4 as uuidv4 } from 'uuid'
import { createHmac } from 'crypto'
import got from 'got'

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
  reauthorizationTokenCallback?: (self: PicaComicAPI) => string | Promise<string>
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

function isPromise<T = any> (obj: any): obj is Promise<T> {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
}

type Response<T> = {
  code: string
  message: string
  data: T
}

export class PicaComicAPI {
  private readonly _fetch: typeof got
  private readonly _opts: Options

  constructor (opts?: Partial<Options>) {
    opts = opts || {}
    this._opts = mergeOptions(opts)
    this._fetch = got.extend({
      prefixUrl: this._opts.app.api,
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
            } = this._opts.app
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
            if (typeof this._opts.reauthorizationTokenCallback !== 'function') return response
            debug('REAUTHORIZATION TOKEN')
            let token = this._opts.reauthorizationTokenCallback(this)
            isPromise(token) && (token = await token)
            const updatedOptions = { headers: makeAuthorizationHeaders(token) }
            return retryWithMergedOptions(updatedOptions)
          }
        ]
      }
    })
  }

  async signIn (payload: { email: string, password: string }): Promise<string> {
    return this._fetch
      .post('auth/sign-in', {
        json: {
          email: payload.email,
          password: payload.password
        }
      })
      .json<Response<{ token: string }>>()
      .then(res => res.data.token)
  }

  async fetchCategories (payload: { token: string }): Promise<types.Category[]> {
    return this._fetch
      .get('categories', { headers: makeAuthorizationHeaders(payload.token) })
      .json<Response<{ categories: types.Category[] }>>()
      .then(res => res.data.categories)
  }

  async fetchComics (payload: { token: string, category: string, page?: number, sort?: 'ua' | 'dd' | 'da' | 'ld' | 'vd' }): Promise<types.Comics> {
    return this._fetch
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
  }

  async fetchComic (payload: { token: string, id: string }): Promise<types.ComicInfo> {
    return this._fetch
      .get(`comics/${payload.id}`, { headers: makeAuthorizationHeaders(payload.token) })
      .json<Response<{ comic: types.ComicInfo }>>()
      .then(res => res.data.comic)
  }

  async fetchComicEpisodes (payload: { token: string, comicId: string, page?: number }): Promise<types.ComicEpisodes> {
    return this._fetch
      .get(`comics/${payload.comicId}/eps`, {
        headers: makeAuthorizationHeaders(payload.token),
        searchParams: {
          page: payload.page || 1
        }
      })
      .json<Response<{ eps: types.ComicEpisodes }>>()
      .then(res => res.data.eps)
  }

  async fetchComicEpisodePages (payload: { token: string, comicId: string, epsOrder: number, page?: number }): Promise<types.ComicEpisodePages> {
    return this._fetch
      .get(`comics/${payload.comicId}/order/${payload.epsOrder}/pages`, {
        headers: makeAuthorizationHeaders(payload.token),
        searchParams: {
          page: payload.page || 1
        }
      })
      .json<Response<types.ComicEpisodePages>>()
      .then(res => res.data)
  }

  stringifyImageUrl(image: { fileServer: string; path: string }): string {
    const { path, fileServer } = image
    const url = new URL(
      `${fileServer.replace(/\/$/, '')}/static/${path.replace(/^\//, '')}`
    )

    if (url.pathname.startsWith('/static/tobeimg')) {
      url.host = 'img.picacomic.com'
      url.pathname = url.pathname.replace('/static/tobeimg', '')
      return url.href
    }

    if (url.pathname.startsWith('/static/static')) {
      url.host = `storage1.picacomic.com`
      url.pathname = url.pathname.replace('/static/static', '/static')
    }

    return url.href
  }

  async fetchImage (image: { fileServer: string, path: string }): Promise<Duplex> {
    const url = this.stringifyImageUrl(image)
    return this._fetch.stream({ prefixUrl: '', url, context: { fetchImage: true } })
  }
}
