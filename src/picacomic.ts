import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { createHmac } from 'crypto'
import qs from 'querystring'

const debug = require('debug')('l2s:picacomic-api')
const isDebug = process.env.DEBUG && /l2s/.test(process.env.DEBUG)

type PicaComicOptions = {
  reqConfig: AxiosRequestConfig
  api: string
  apiKey: string
  signatureKey: string
  accept: string
  appChannel: string
  appVersion: string
  appUUID: string
  appPlatform: string
  appBuildVersion: string
  userAgent: string
  imageQuality: string
}

const DEF_OPTS: PicaComicOptions = {
  reqConfig: { maxRedirects: 0 },
  api: 'https://picaapi.picacomic.com/',
  apiKey: 'C69BAF41DA5ABD1FFEDC6D2FEA56B',
  signatureKey: '~d}$Q7$eIni=V)9\\RK/P.RM4;9[7|@/CA}b~OW!3?EV`:<>M7pddUBL5n|0/*Cn',
  accept: 'application/vnd.picacomic.com.v1+json',
  appChannel: '2',
  appVersion: '2.2.1.2.3.3',
  appUUID: 'defaultUuid',
  appPlatform: 'android',
  appBuildVersion: '44',
  userAgent: 'okhttp/3.8.1',
  imageQuality: 'original'
}

class PicaComic {
  static DEF_OPTS: PicaComicOptions = DEF_OPTS
  readonly req: AxiosInstance
  readonly opts: PicaComicOptions
  constructor (opts?: Partial<PicaComicOptions>) {
    this.opts = { ...opts, ...DEF_OPTS }
    this.req = axios.create({
      baseURL: opts?.api || DEF_OPTS.api,
      ...DEF_OPTS.reqConfig,
      ...opts?.reqConfig
    })
    this.req.interceptors.request.use(this.requestHeaderAppender.bind(this))
    if (isDebug) {
      this.req.interceptors.request.use((config) => {
        debug('AXIOS %s -> %s', config.method, config.url)
        return config
      })
    }
  }

  private requestHeaderAppender (config: AxiosRequestConfig): AxiosRequestConfig {
    const url = config.url! + (config.params ? '?' + qs.stringify(config.params) : '')
    const method = config.method!
    const {
      api, apiKey, signatureKey,
      appChannel, appVersion, appUUID, appPlatform, appBuildVersion,
      accept, imageQuality, userAgent
    } = this.opts
    const nonce = uuidv4().replace(/-/g, '')
    const time = (Date.now() / 1000).toFixed(0)
    const con = (
      (url.charAt(0) === '/' ? url.substring(1) : url).replace(api, '') +
      time +
      nonce +
      method +
      apiKey
    ).toLowerCase()
    const signature = createHmac('sha256', signatureKey).update(con).digest().toString('hex')
    mergeHeaders(config, {
      time,
      nonce,
      accept,
      signature,
      'api-key': apiKey,
      'app-channel': appChannel,
      'app-version': appVersion,
      'app-uuid': appUUID,
      'app-platform': appPlatform,
      'app-build-version': appBuildVersion,
      'user-agent': userAgent,
      'image-quality': imageQuality
    })
    return config
  }

  signIn!: (email: string, password: string) => Promise<string>
  categories!: (token: string) => Promise<any>
  comics!: (token: string, payload: any) => Promise<any>
}

function mergeHeaders (config: AxiosRequestConfig, right: any) {
  if (!config.headers) config.headers = right
  else for (const key in right) config.headers[key] = right[key]
}

export { PicaComicOptions }
export default PicaComic
