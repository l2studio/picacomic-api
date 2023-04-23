import got, { Got, Options, ExtendOptions, Response } from 'got'
import {
  BaseResponse,
  RegisterPayload,
  SignInPayload,
  SignInResponse,
  AuthorizationPayload,
  PunchInResponse,
  UserProfileResponse,
  ComicSort,
  UserFavouritePayload,
  UserFavouriteResponse,
  CategoriesResponse,
  ComicsPayload,
  ComicsResponse,
  ComicIdPayload,
  ComicDetailPayload,
  ComicDetailResponse,
  ComicEpisodesPayload,
  ComicEpisodesResponse,
  ComicEpisodePagesPayload,
  ComicEpisodePagesResponse,
  ComicCommentsPayload,
  ComicCommentsResponse,
  SearchComicsPayload,
  SearchComicsResponse,
  SwitchComicLikeResponse,
  SwitchComicFavouriteResponse,
  UserProfileSloganPayload,
  ImageMediaPayload
} from './type'
import { v4 as uuidv4 } from 'uuid'
import { createHmac } from 'crypto'
import assert from 'assert'

export interface PicaComicOptions {
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

interface FetcherInstanceHolder {
  fetch: Got
  appOptions?: Partial<PicaComicOptions>
}

type EndpointPayloadTransformer<T = unknown> = (payload: T) => Options | undefined
type DeclaredEndpoint<R extends BaseResponse, T = unknown> = (payload: T) => Promise<R>
type DeclaredEndpointWithFetcher<R extends BaseResponse, T = unknown> = (fetcher: FetcherInstanceHolder, payload: T) => Promise<R>

type PickDeclaredEndpointFromInstance<Instance> =
  Instance extends DeclaredEndpointWithFetcher<infer R, infer T>
    ? DeclaredEndpoint<R, T>
    : never

const defaultPicaComicOptions: PicaComicOptions = {
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

function fixedSearchParams (searchParams?: Options['searchParams']): string {
  if (typeof searchParams === 'string') {
    return searchParams[0] === '?' ? searchParams : '?' + searchParams
  } else if (searchParams instanceof URLSearchParams) {
    return `?${searchParams.toString()}`
  } else if (typeof searchParams === 'object') {
    const params = Object.entries(searchParams).map(([key, value]) => `${key}=${value}`)
    return `?${params.join('&')}`
  } else {
    return ''
  }
}

function getBeforeRequestOptions (transformedOptions: Options, appOptions?: Partial<PicaComicOptions>): Options {
  assert(transformedOptions.url && typeof transformedOptions.url === 'string', 'endpoint must be a string')
  assert(transformedOptions.method, 'method is required')

  const method = transformedOptions.method
  const endpoint = transformedOptions.url + fixedSearchParams(transformedOptions.searchParams)
  const fixedEndpoint = endpoint[0] === '/' ? endpoint.substring(1) : endpoint
  delete transformedOptions.url // must override prefix url and endpoint

  const mergedPicaComicOptions = { ...defaultPicaComicOptions, ...appOptions }
  const timestamp = (Date.now() / 1000).toFixed(0)
  const nonce = uuidv4().replace(/-/g, '')
  const con = (fixedEndpoint + timestamp + nonce + method + mergedPicaComicOptions.apiKey).toLowerCase()
  const signature = createHmac('sha256', mergedPicaComicOptions.signatureKey).update(con).digest().toString('hex')

  const headers: Options['headers'] = {}
  headers.time = timestamp
  headers.nonce = nonce
  headers.signature = signature
  headers.accept = mergedPicaComicOptions.accept
  headers['api-key'] = mergedPicaComicOptions.apiKey
  headers['app-channel'] = mergedPicaComicOptions.channel
  headers['app-version'] = mergedPicaComicOptions.version
  headers['app-uuid'] = mergedPicaComicOptions.uuid
  headers['app-platform'] = mergedPicaComicOptions.platform
  headers['app-build-version'] = mergedPicaComicOptions.buildVersion
  headers['image-quality'] = mergedPicaComicOptions.imageQuality
  headers['user-agent'] = mergedPicaComicOptions.userAgent
  headers['content-type'] = 'application/json; charset=UTF-8'

  return {
    prefixUrl: mergedPicaComicOptions.api,
    url: fixedEndpoint,
    headers,
    throwHttpErrors: false,
    responseType: 'json'
  }
}

function declareEndpoint <R extends BaseResponse, T> (
  transformer: EndpointPayloadTransformer<T>,
  bodyHandler?: (body: BaseResponse) => R
): DeclaredEndpointWithFetcher<R, T> {
  return async function declaredEndpoint (fetcher, payload) {
    const transformedOptions = transformer(payload) || {}
    const beforeRequestOptions = getBeforeRequestOptions(transformedOptions, fetcher.appOptions)
    const mergedOptions = fetcher.fetch.mergeOptions(transformedOptions, beforeRequestOptions)
    const response = await fetcher.fetch(mergedOptions) as Response<unknown>
    const body = await response.body as R | PicaComicError
    if ('error' in body && typeof body.error === 'string') {
      throw new PicaComicError(body.code, body.error, body.message, body.detail)
    } else {
      return typeof bodyHandler === 'function'
        ? bodyHandler(body as BaseResponse)
        : body as R
    }
  }
}

export class PicaComicError extends Error {
  readonly code: number
  readonly error: string
  readonly detail?: string
  constructor (code: number, error: string, message: string, detail?: string) {
    super(message)
    this.name = 'PicaComicError'
    this.code = code
    this.error = error
    this.detail = detail
  }
}

/* Endpoints */

export const Endpoints = {
  register: declareEndpoint<BaseResponse<undefined>, RegisterPayload>(payload => {
    if (payload.birthday instanceof Date) {
      payload.birthday = payload.birthday.valueOf()
    }
    return {
      url: '/auth/register',
      method: 'POST',
      json: payload
    }
  }),
  signIn: declareEndpoint<SignInResponse, SignInPayload>(payload => ({
    url: '/auth/sign-in',
    method: 'POST',
    json: {
      email: payload.email,
      password: payload.password
    }
  })),
  punchIn: declareEndpoint<PunchInResponse, AuthorizationPayload>(payload => ({
    url: '/users/punch-in',
    method: 'POST',
    headers: { authorization: payload.token }
  })),
  fetchUserProfile: declareEndpoint<UserProfileResponse, AuthorizationPayload>(payload => ({
    url: '/users/profile',
    method: 'GET',
    headers: { authorization: payload.token }
  })),
  fetchUserFavourite: declareEndpoint<UserFavouriteResponse, AuthorizationPayload & UserFavouritePayload>(payload => ({
    url: '/users/favourite',
    method: 'GET',
    headers: { authorization: payload.token },
    searchParams: {
      page: payload.page || 1,
      s: payload.sort || ComicSort.Default
    }
  })),
  fetchCategories: declareEndpoint<CategoriesResponse, AuthorizationPayload>(payload => ({
    url: '/categories',
    method: 'GET',
    headers: { authorization: payload.token }
  })),
  fetchComics: declareEndpoint<ComicsResponse, AuthorizationPayload & ComicsPayload>(payload => ({
    url: '/comics',
    method: 'GET',
    headers: { authorization: payload.token },
    searchParams: {
      c: payload.category,
      page: payload.page || 1,
      s: payload.sort || ComicSort.Default
    }
  })),
  fetchComicDetail: declareEndpoint<ComicDetailResponse, AuthorizationPayload & ComicDetailPayload>(payload => ({
    url: `/comics/${payload.comicId}`,
    method: 'GET',
    headers: { authorization: payload.token }
  })),
  fetchComicEpisodes: declareEndpoint<ComicEpisodesResponse, AuthorizationPayload & ComicEpisodesPayload>(payload => ({
    url: `/comics/${payload.comicId}/eps`,
    method: 'GET',
    headers: { authorization: payload.token },
    searchParams: { page: payload.page || 1 }
  })),
  fetchComicEpisodePages: declareEndpoint<ComicEpisodePagesResponse, AuthorizationPayload & ComicEpisodePagesPayload>(payload => ({
    url: `/comics/${payload.comicId}/order/${payload.order}/pages`,
    method: 'GET',
    headers: { authorization: payload.token },
    searchParams: { page: payload.page || 1 }
  })),
  fetchComicComments: declareEndpoint<ComicCommentsResponse, AuthorizationPayload & ComicCommentsPayload>(payload => ({
    url: `/comics/${payload.comicId}/comments`,
    method: 'GET',
    headers: { authorization: payload.token },
    searchParams: { page: payload.page || 1 }
  }), (body) => {
    // Fixed page type problem
    if (body.data !== null && typeof body.data === 'object' && 'comments' in body.data) {
      const comments = (body.data as ComicCommentsResponse['data']).comments
      if (comments && typeof comments.page === 'string') {
        comments.page = parseInt(comments.page)
      }
    } return body as ComicCommentsResponse
  }),
  searchComics: declareEndpoint<SearchComicsResponse, AuthorizationPayload & SearchComicsPayload>(payload => ({
    url: '/comics/advanced-search',
    method: 'POST',
    headers: { authorization: payload.token },
    searchParams: { page: payload.page || 1 },
    json: {
      keyword: payload.keyword,
      categories: payload.categories,
      s: payload.sort || ComicSort.Default
    }
  })),
  switchComicLike: declareEndpoint<SwitchComicLikeResponse, AuthorizationPayload & ComicIdPayload>(payload => ({
    url: `/comics/${payload.comicId}/like`,
    method: 'POST',
    headers: { authorization: payload.token }
  })),
  switchComicFavourite: declareEndpoint<SwitchComicFavouriteResponse, AuthorizationPayload & ComicIdPayload>(payload => ({
    url: `/comics/${payload.comicId}/favourite`,
    method: 'POST',
    headers: { authorization: payload.token }
  })),
  setUserProfileSlogan: declareEndpoint<BaseResponse<undefined>, AuthorizationPayload & UserProfileSloganPayload>(payload => ({
    url: '/users/profile',
    method: 'PUT',
    headers: { authorization: payload.token },
    json: { slogan: payload.slogan }
  }))
}

export interface PicaComicAPIOptions {
  fetch?: Got | ExtendOptions
  appOptions?: Partial<PicaComicOptions>
  // eslint-disable-next-line no-use-before-define
  reauthorizationTokenCallback?: (self: PicaComicAPI) => string | undefined | Promise<string | undefined>
}

function createReauthorizationTokenHook (self: PicaComicAPI): ExtendOptions {
  return {
    hooks: {
      afterResponse: [async (response, retryWithMergedOptions) => {
        if (response.statusCode !== 401) return response
        if (typeof self.reauthorizationTokenCallback !== 'function') return response

        const token = await self.reauthorizationTokenCallback(self)
        if (!token) return response

        const updatedOptions = { headers: { authorization: token } }
        return retryWithMergedOptions(updatedOptions)
      }]
    }
  }
}

const ImageToBeImg = 'https://img.picacomic.com'
const ImageToBs = 'https://storage-b.picacomic.com'
const ImageDefault = 'https://storage1.picacomic.com'

function decodeImageTobeImgPath (path: string): string {
  if (!path.startsWith('tobeimg/')) return path
  const filename = path.substring(path.lastIndexOf('/') + 1)
  const encoded = filename.substring(0, filename.lastIndexOf('.'))
  const absoluteUrl = Buffer.from(encoded, 'base64').toString('utf-8')
  return absoluteUrl
}

export class PicaComicAPI implements FetcherInstanceHolder {
  public readonly fetch: Got
  public readonly appOptions?: Partial<PicaComicOptions>
  public readonly reauthorizationTokenCallback?: (self: this) => string | undefined | Promise<string | undefined>

  constructor (options?: PicaComicAPIOptions) {
    this.appOptions = options?.appOptions
    this.reauthorizationTokenCallback = options?.reauthorizationTokenCallback

    const reauthorizationTokenHook = createReauthorizationTokenHook(this)
    this.fetch = options?.fetch && typeof options.fetch === 'object'
      ? got.extend(options.fetch, reauthorizationTokenHook)
      : got.extend(reauthorizationTokenHook)

    // create endpoint bindings
    Object.entries(Endpoints).forEach(([key, value]) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this[key] = value.bind(this, this)
    })
  }

  readonly declare register: PickDeclaredEndpointFromInstance<typeof Endpoints.register>
  readonly declare signIn: PickDeclaredEndpointFromInstance<typeof Endpoints.signIn>
  readonly declare punchIn: PickDeclaredEndpointFromInstance<typeof Endpoints.punchIn>
  readonly declare fetchUserProfile: PickDeclaredEndpointFromInstance<typeof Endpoints.fetchUserProfile>
  readonly declare fetchUserFavourite: PickDeclaredEndpointFromInstance<typeof Endpoints.fetchUserFavourite>
  readonly declare fetchCategories: PickDeclaredEndpointFromInstance<typeof Endpoints.fetchCategories>
  readonly declare fetchComics: PickDeclaredEndpointFromInstance<typeof Endpoints.fetchComics>
  readonly declare fetchComicDetail: PickDeclaredEndpointFromInstance<typeof Endpoints.fetchComicDetail>
  readonly declare fetchComicEpisodes: PickDeclaredEndpointFromInstance<typeof Endpoints.fetchComicEpisodes>
  readonly declare fetchComicEpisodePages: PickDeclaredEndpointFromInstance<typeof Endpoints.fetchComicEpisodePages>
  readonly declare fetchComicComments: PickDeclaredEndpointFromInstance<typeof Endpoints.fetchComicComments>
  readonly declare searchComics: PickDeclaredEndpointFromInstance<typeof Endpoints.searchComics>
  readonly declare switchComicLike: PickDeclaredEndpointFromInstance<typeof Endpoints.switchComicLike>
  readonly declare switchComicFavourite: PickDeclaredEndpointFromInstance<typeof Endpoints.switchComicFavourite>
  readonly declare setUserProfileSlogan: PickDeclaredEndpointFromInstance<typeof Endpoints.setUserProfileSlogan>

  readonly stringifyImageUrl = (payload: ImageMediaPayload): string => {
    let { path, fileServer } = payload

    if (path.startsWith('tobeimg/')) {
      if (fileServer === ImageDefault || fileServer === ImageToBs) {
        // See above
        return decodeImageTobeImgPath(path)
      } else {
        fileServer ||= ImageToBeImg
        path = '/' + path.substring(8)
      }
    } else if (path.startsWith('tobs/')) {
      fileServer ||= ImageToBs
      path = '/static/' + path.substring(5)
    } else {
      fileServer ||= ImageDefault
      path = '/static/' + path
    }

    return fileServer.replace(/\/$/, '') + path
  }

  readonly createImageRequest = (payload: ImageMediaPayload) => {
    const url = this.stringifyImageUrl(payload)
    return this.fetch.stream({
      prefixUrl: '',
      url
    })
  }

  readonly createImageRequestAsBuffer = (payload: ImageMediaPayload): Promise<Buffer> => {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const request = this.createImageRequest(payload)
        const buf: Buffer[] = []
        request.once('error', reject)
        request.on('data', (chunk: Buffer) => { buf.push(chunk) })
        request.once('end', () => {
          resolve(Buffer.concat(buf))
        })
      } catch (e) {
        reject(e)
      }
    })
  }
}
