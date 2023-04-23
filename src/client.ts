import { PicaComicAPI, PicaComicAPIOptions } from './api'
import * as types from './type'

export interface PicaComicClientOptions extends Omit<PicaComicAPIOptions, 'reauthorizationTokenCallback'> {
  email: string
  password: string
  token?: string
  onTokenIssued?: (token: string) => void | Promise<void>
}

export class PicaComicClient {
  public readonly email: string
  public readonly password: string
  public readonly api: PicaComicAPI
  public readonly onTokenIssued?: (token: string) => void | Promise<void>
  public token: string

  constructor (options: PicaComicClientOptions) {
    this.email = options.email
    this.password = options.password
    this.token = options.token || ''
    this.onTokenIssued = options.onTokenIssued
    this.api = new PicaComicAPI({
      appOptions: options.appOptions,
      fetch: options.fetch,
      reauthorizationTokenCallback: PicaComicClient.reauthorizationTokenCallback.bind(this)
    })
  }

  private static async reauthorizationTokenCallback (this: PicaComicClient, api: PicaComicAPI): Promise<string> {
    const response = await api.signIn({ email: this.email, password: this.password })
    const newToken = response.data.token
    this.token = newToken
    await this.onTokenIssued?.(newToken)
    return newToken
  }

  punchIn (): Promise<types.PunchInResponse> {
    return this.api.punchIn({ token: this.token })
  }

  fetchUserProfile (): Promise<types.UserProfileResponse> {
    return this.api.fetchUserProfile({ token: this.token })
  }

  fetchUserFavourite (payload: types.UserFavouritePayload): Promise<types.UserFavouriteResponse> {
    return this.api.fetchUserFavourite({ token: this.token, ...payload })
  }

  fetchCategories (): Promise<types.CategoriesResponse> {
    return this.api.fetchCategories({ token: this.token })
  }

  fetchComics (payload: types.ComicsPayload): Promise<types.ComicsResponse> {
    return this.api.fetchComics({ token: this.token, ...payload })
  }

  fetchComicDetail (payload: types.ComicDetailPayload): Promise<types.ComicDetailResponse> {
    return this.api.fetchComicDetail({ token: this.token, ...payload })
  }

  fetchComicEpisodes (payload: types.ComicEpisodesPayload): Promise<types.ComicEpisodesResponse> {
    return this.api.fetchComicEpisodes({ token: this.token, ...payload })
  }

  fetchComicEpisodePages (payload: types.ComicEpisodePagesPayload): Promise<types.ComicEpisodePagesResponse> {
    return this.api.fetchComicEpisodePages({ token: this.token, ...payload })
  }

  fetchComicComments (payload: types.ComicCommentsPayload): Promise<types.ComicCommentsResponse> {
    return this.api.fetchComicComments({ token: this.token, ...payload })
  }

  searchComics (payload: types.SearchComicsPayload): Promise<types.SearchComicsResponse> {
    return this.api.searchComics({ token: this.token, ...payload })
  }

  switchComicLike (payload: types.ComicIdPayload): Promise<types.SwitchComicLikeResponse> {
    return this.api.switchComicLike({ token: this.token, ...payload })
  }

  switchComicFavourite (payload: types.ComicIdPayload): Promise<types.SwitchComicFavouriteResponse> {
    return this.api.switchComicFavourite({ token: this.token, ...payload })
  }

  setUserProfileSlogan (payload: types.UserProfileSloganPayload): Promise<types.BaseResponse<undefined>> {
    return this.api.setUserProfileSlogan({ token: this.token, ...payload })
  }

  stringifyImageUrl (payload: types.ImageMediaPayload): string {
    return this.api.stringifyImageUrl(payload)
  }

  createImageRequest (payload: types.ImageMediaPayload): ReturnType<PicaComicAPI['createImageRequest']> {
    return this.api.createImageRequest(payload)
  }

  createImageRequestAsBuffer (payload: types.ImageMediaPayload): Promise<Buffer> {
    return this.api.createImageRequestAsBuffer(payload)
  }
}
