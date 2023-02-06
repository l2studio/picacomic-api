export interface BaseResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface RegisterPayload {
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
}

export interface SignInPayload {
  email: string
  password: string
}

export type SignInResponse = BaseResponse<{ token: string }>

export interface AuthorizationPayload {
  token: string
}

export type PunchInResponse = BaseResponse<{ res: { status: 'ok' | 'fail', punchInLastDay?: string } }>

export interface ImageMedia {
  originalName: string
  path: string
  fileServer: string
}

export interface User {
  _id: string
  birthday: string
  email: string
  gender: 'm' | 'f' | 'bot'
  name: string
  slogan?: string
  title: string
  verified: boolean
  exp: number
  level: number
  characters: string[]
  character?: string
  role?: string
  created_at: string
  avatar?: ImageMedia
  isPunched: boolean
}

export type UserProfileResponse = BaseResponse<{ user: User }>

export enum ComicSort {
  Default = 'ua',
  NewToOld = 'dd',
  OldToNew = 'da',
  Like = 'ld',
  View = 'vd'
}

export interface UserFavouritePayload {
  page?: number
  sort?: ComicSort
}

export interface Comic {
  _id: string
  title: string
  author?: string
  totalViews: number
  totalLikes: number
  pagesCount: number
  epsCount: number
  finished: boolean
  categories: string[]
  thumb: ImageMedia
  likesCount: number
  id?: string
}

export type UserFavouriteResponse = BaseResponse<{
  comics: {
    docs: Comic[]
    total: number
    limit: number
    page: number
    pages: number
  }
}>

export interface Category {
  _id?: string
  title: string
  thumb: ImageMedia
  isWeb?: boolean
  active?: boolean
  link?: string
  description?: string
}

export type CategoriesResponse = BaseResponse<{ categories: Category[] }>

export interface ComicsPayload {
  /** Category title */
  category: string
  page?: number
  sort?: ComicSort
}

export type ComicsResponse = BaseResponse<{
  comics: {
    docs: Comic[]
    total: number
    limit: number
    page: number
    pages: number
  }
}>

export interface Creator {
  _id: string
  gender: string
  name: string
  slogan?: string
  title?: string
  verified?: boolean
  exp: number
  level: number
  characters: string[]
  character?: string
  role?: string
  avatar?: ImageMedia
}

export interface ComicDetail extends Comic {
  _creator: Creator
  chineseTeam: string
  description?: string
  tags: string[]
  updated_at: string
  created_at: string
  allowDownload: boolean
  allowComment: boolean
  viewsCount: number
  commentsCount: number
  isFavourite: boolean
  isLiked: boolean
}

export interface ComicIdPayload {
  comicId: string
}

export type ComicDetailPayload = ComicIdPayload

export type ComicDetailResponse = BaseResponse<{ comic: ComicDetail }>

export interface ComicEpisode {
  _id: string
  title: string
  order: number
  updated_at: string
  id: string
}

export interface ComicEpisodesPayload extends ComicIdPayload {
  page?: number
}

export type ComicEpisodesResponse = BaseResponse<{
  eps: {
    docs: ComicEpisode[]
    total: number
    limit: number
    page: number
    pages: number
  }
}>

export interface ComicEpisodePage {
  _id: string
  media: ImageMedia
  id: string
}

export interface ComicEpisodePagesPayload extends ComicIdPayload {
  order: number
  page?: number
}

export type ComicEpisodePagesResponse = BaseResponse<{
  pages: {
    docs: ComicEpisodePage[]
    total: number
    limit: number
    page: number
    pages: number
  },
  ep: Pick<ComicEpisode, '_id' | 'title'>
}>

export interface ComicCommentsPayload extends ComicIdPayload {
  page?: number
}

export interface ComicComment {
  _id: string
  _user: Creator
  _comic: string
  content: string
  isTop: boolean
  hide: boolean
  created_at: string
  likesCount: number
  commentsCount: number
  isLiked: boolean
  id: string
}

export type ComicCommentsResponse = BaseResponse<{
  comments: {
    docs: ComicComment[]
    total: number
    limit: number
    page: number
    pages: number
  }
  topComments: ComicComment[]
}>

export interface SearchedComic {
  _id: string
  title: string
  author?: string
  totalViews?: number
  totalLikes?: number
  likesCount: number
  finished: boolean
  categories: string[]
  thumb: ImageMedia
  chineseTeam?: string
  description?: string
  tags: string[]
  updated_at: string
  created_at: string
}

export interface SearchComicsPayload {
  keyword: string
  categories?: string[]
  page?: number
  sort?: ComicSort
}

export type SearchComicsResponse = BaseResponse<{
  comics: {
    docs: SearchedComic[]
    total: number
    limit: number
    page: number
    pages: number
  }
}>

export type SwitchComicLikeResponse = BaseResponse<{ action: 'like' | 'unlike' }>

export type SwitchComicFavouriteResponse = BaseResponse<{ action: 'favourite' | 'un_favourite' }>

export interface UserProfileSloganPayload {
  slogan: string
}
