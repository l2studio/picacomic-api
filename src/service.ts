import type * as types from './type'
import { PicaComicAPI, Options } from './api'
import { isPromise } from './util'

export type ServiceOptions = Partial<Omit<Options, 'reauthorizationTokenCallback'>> & {
  email: string
  password: string
  token?: string
  onReauthorizationToken?: (token: string) => void | Promise<void>
}

export class PicaComicService {
  public readonly api: PicaComicAPI
  public readonly email: string
  public readonly password: string
  public readonly onReauthorizationToken?: (token: string) => void | Promise<void>
  public token: string

  constructor (opts: ServiceOptions) {
    const { email, password, token, onReauthorizationToken, ...other } = opts
    this.email = email
    this.password = password
    this.token = token || ''
    this.onReauthorizationToken = onReauthorizationToken
    this.api = new PicaComicAPI({
      ...other,
      reauthorizationTokenCallback: async (self) => {
        const token = await self.signIn({ email, password })
        this.token = token

        if (isPromise(this.onReauthorizationToken)) {
          await this.onReauthorizationToken(token)
        } else if (this.onReauthorizationToken) {
          this.onReauthorizationToken(token)
        }

        return token
      }
    })
  }

  async punchIn (): ReturnType<PicaComicAPI['punchIn']> {
    return this.api.punchIn({ token: this.token })
  }

  async fetchUserProfile (): ReturnType<PicaComicAPI['fetchUserProfile']> {
    return this.api.fetchUserProfile({ token: this.token })
  }

  async fetchUserFavourites (payload?: { page?: number, sort?: types.ComicSort }): ReturnType<PicaComicAPI['fetchUserFavourite']> {
    return this.api.fetchUserFavourite({ token: this.token, ...payload })
  }

  async fetchCategories (): ReturnType<PicaComicAPI['fetchCategories']> {
    return this.api.fetchCategories({ token: this.token })
  }

  async fetchComics (payload: { category: string, page?: number, sort?: types.ComicSort }): ReturnType<PicaComicAPI['fetchComics']> {
    return this.api.fetchComics({ token: this.token, ...payload })
  }

  async fetchComic (payload: { id: string }): ReturnType<PicaComicAPI['fetchComic']> {
    return this.api.fetchComic({ token: this.token, ...payload })
  }

  async fetchComicComments (payload: { comicId: string, page?: number }): ReturnType<PicaComicAPI['fetchComicComments']> {
    return this.api.fetchComicComments({ token: this.token, ...payload })
  }

  async fetchComicEpisodes (payload: { comicId: string, page?: number }): ReturnType<PicaComicAPI['fetchComicEpisodes']> {
    return this.api.fetchComicEpisodes({ token: this.token, ...payload })
  }

  async fetchComicEpisodePages (payload: { comicId: string, epsOrder: number, page?: number }): ReturnType<PicaComicAPI['fetchComicEpisodePages']> {
    return this.api.fetchComicEpisodePages({ token: this.token, ...payload })
  }

  async search (payload: { keyword: string, categories?: string[], page?: number, sort?: types.ComicSort }): ReturnType<PicaComicAPI['search']> {
    return this.api.search({ token: this.token, ...payload })
  }

  async switchComicLike (payload: { id: string }): ReturnType<PicaComicAPI['switchComicLike']> {
    return this.api.switchComicLike({ token: this.token, ...payload })
  }

  async switchComicFavourite (payload: { id: string }): ReturnType<PicaComicAPI['switchComicFavourite']> {
    return this.api.switchComicFavourite({ token: this.token, ...payload })
  }

  async setUserProfileSlogan (payload: { slogan: string }): ReturnType<PicaComicAPI['setUserProfileSlogan']> {
    return this.api.setUserProfileSlogan({ token: this.token, ...payload })
  }

  stringifyImageUrl (image: { path: string, fileServer?: string }): ReturnType<PicaComicAPI['stringifyImageUrl']> {
    return this.api.stringifyImageUrl(image)
  }

  fetchImage (image: { path: string, fileServer?: string }): ReturnType<PicaComicAPI['fetchImage']> {
    return this.api.fetchImage(image)
  }
}
