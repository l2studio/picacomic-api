/* eslint-disable camelcase */

export interface Image {
  originalName: string
  path: string
  fileServer: string
}

export interface PunchInResponse {
  status: 'ok' | 'fail'
  punchInLastDay?: string
}

export interface User {
  _id: string
  birthday: string
  email: string
  gender: string
  name: string
  slogan?: string
  title: string
  verified: boolean
  exp: number
  level: number
  characters: string[]
  created_at: string
  avatar?: Image
  isPunched: boolean
}

export interface Category {
  _id: string
  title: string
  thumb: Image
  isWeb?: boolean
  active?: boolean
  link?: string
  description?: string
}

export interface Comic {
  _id: string
  id: string
  title: string
  author?: string
  totalViews: number
  totalLikes: number
  likesCount: number
  pagesCount: number
  epsCount: number
  finished: boolean
  categories: string[]
  thumb: Image
}

export interface Paginate<T> {
  docs: T
  total: number
  limit: number
  page: number
  pages: number
}

export interface Comics extends Paginate<Comic[]> {}

export interface Creator {
  _id: string
  name: string
  gender: string
  verified: boolean
  exp: number
  level: number
  characters: string[]
  role: string
  avatar: Image
  title: string
  slogan: string
  character: string
}

export interface ComicInfo extends Comic {
  _creator: Creator
  chineseTeam: string
  description?: string
  tags: string[]
  updated_at: string
  created_at: string
  allowDownload: boolean
  allowComment: boolean
  isFavourite: boolean
  isLiked: boolean
  commentsCount: number
}

export interface ComicComment {
  _id: string
  id: string
  content: string
  _user: Omit<User, 'birthday' | 'email' | 'isPunched' | 'created_at'> & {
    role: string
    character?: string
  }
  _comic: string
  isTop: boolean
  hide: boolean
  created_at: string
  likesCount: number
  commentsCount: number
  isLiked: boolean
}

export interface ComicComments {
  comments: Paginate<ComicComment[]>
  topComments: ComicComment[]
}

export interface ComicEpisode {
  _id: string
  id: string
  title: string
  order: number
  updated_at: string
}

export interface ComicEpisodes extends Paginate<ComicEpisode[]> {}

export interface ComicEpisodePage {
  _id: string
  id: string
  media: Image
}

export interface ComicEpisodePages {
  pages: Paginate<ComicEpisodePage[]>
  ep: {
    _id: string
    title: string
  }
}

export type ComicSort = 'ua' | 'dd' | 'da' | 'ld' | 'vd'

export const ComicSorts: Record<'DEFAULT' | 'NEW_TO_OLD' | 'OLD_TO_NEW' | 'LIKE' | 'VIEW', ComicSort> = {
  DEFAULT: 'ua',
  NEW_TO_OLD: 'dd',
  OLD_TO_NEW: 'da',
  LIKE: 'ld',
  VIEW: 'vd'
}
