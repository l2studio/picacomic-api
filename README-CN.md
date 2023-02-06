- [English](README.md)
- **简体中文**

# L2 Studio - PicaComic API

<p>
<a href="https://github.com/l2studio/picacomic-api/actions"><img src="https://img.shields.io/github/actions/workflow/status/l2studio/picacomic-api/ci.yml?branch=main&logo=github&style=flat-square"/></a>
<a href="https://www.npmjs.com/package/@l2studio/picacomic-api"><img src="https://img.shields.io/npm/v/@l2studio/picacomic-api?logo=npm&style=flat-square"/></a>
</p>

一个用于 PicaComic 哔咔的 HTTP 网站 API

## 安装

```shell
npm install --save @l2studio/picacomic-api
# 或者
pnpm i @l2studio/picacomic-api
```

## API

> 目前为 v0.2.0 版本的文档。旧版本另见：[v0.1.x](https://github.com/l2studio/picacomic-api/tree/0.1.13#readme)

**此 v0.2.x 是破坏性更新，但是对类型定义更具体化。以及对代码的重构和优化。**

```typescript
import { PicaComicAPI } from '@l2studio/picacomic-api'

class PicaComicAPI {
  public readonly fetch: typeof got
  public readonly appOptions: Partial<PicaComicOptions>
  public readonly reauthorizationTokenCallback?: (self: this) => string | undefined | Promise<string | undefined>
  constructor (options?: PicaComicAPIOptions)
}
```

### API Options

```typescript
interface PicaComicOptions {
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

interface PicaComicAPIOptions {
  // Got 实例或扩展选项 (optional)
  // 请见: https://github.com/sindresorhus/got/tree/v11
  fetch?: Got | ExtendOptions

  // PicaComic app 客户端选项（可选）
  // 另见上: PicaComicOptions
  appOptions?: Partial<PicaComicOptions>

  // 用于在令牌无效时重新认证并返回新令牌的回调函数。（可选）
  // 例子:
  //   async reauthorizationTokenCallback (self) {
  //     console.log('令牌无效, 重新认证...')
  //     return await self.signIn({
  //       email   : '你的 PicaComic 哔咔账户邮箱',
  //       password: '你的 PicaComic 哔咔账户密码'
  //     })
  //   }
  reauthorizationTokenCallback?: (self: PicaComicAPI) => string | undefined | Promise<string | undefined>
}
```

### PicaComicError

```typescript
class PicaComicError extends Error {
  readonly code: number
  readonly error: string
  readonly message: string
  readonly detail?: string
}
```

### .register

```typescript
/**
 * 使用给定的有效负载注册一个 PicaComic 哔咔帐户。
 *
 * @param payload - RegisterPayload {
 *   name      - 昵称（2 - 50 字符）
 *   email     - 邮箱（允许: [0-9 a-z . _]）
 *   password  - 密码（大于 8 个字符）
 *   question1 - 安全问题 1
 *   question2 -         2
 *   question3 -         3
 *   answer1   - 安全问题 1 答案
 *   answer2   -         2 答案
 *   answer3   -         3 答案
 *   birthday  - 生日（'YYYY-MM-DD' | Date | Milliseconds）需要年满 18 岁
 *   gender    - 性别（'m' | 'f' | 'bot'）
 * }
 * @return BaseResponse<undefined>
 */
PicaComicAPI.register(payload: RegisterPayload): Promise<BaseResponse<undefined>>
```

### .signIn

```typescript
/**
 * 使用给定的电子邮件和密码有效负载登录到 PicaComic 哔咔帐户。
 *
 * @param payload - SignInPayload {
 *   email    - 你的哔咔账户邮箱
 *   password -            密码
 * }
 * @return SignInResponse
 */
PicaComicAPI.signIn(payload: SignInPayload): Promise<SignInResponse>
```

### .punchIn

```typescript
/**
 * 使用给定的访问令牌有效负载打卡 PicaComic 哔咔帐户。
 *
 * @param payload - AuthorizationPayload { token - 访问令牌 }
 * @return PunchInResponse
 */
PicaComicAPI.punchIn(payload: AuthorizationPayload): Promise<PunchInResponse>
```

### .fetchUserProfile

```typescript
/**
 * 使用给定的访问令牌有效负载获取用户档案。
 *
 * @param payload - AuthorizationPayload { token - 访问令牌 }
 * @return UserProfileResponse
 */
PicaComicAPI.fetchUserProfile(payload: AuthorizationPayload): Promise<UserProfileResponse>
```

### .fetchUserFavourite

```typescript
/**
 * 使用给定的有效负载获取用户收藏的漫画。
 *
 * @param payload - AuthorizationPayload & UserFavouritePayload {
 *   token - 访问令牌
 *   page  - 页数（可选）
 *   sort  - 排序类型（可选）
 * }
 * @return UserFavouriteResponse
 */
PicaComicAPI.fetchUserFavourite(payload: AuthorizationPayload & UserFavouritePayload): Promise<UserFavouriteResponse>
```

### .fetchCategories

```typescript
/**
 * 使用给定的访问令牌有效负载获取所有分类。
 *
 * @param payload - AuthorizationPayload { token - 访问令牌 }
 * @return CategoriesResponse
 */
PicaComicAPI.fetchCategories(payload: AuthorizationPayload): Promise<CategoriesResponse>
```

### .fetchComics

```typescript
/**
 * 使用给定的有效负载获取漫画。
 *
 * @param payload -  AuthorizationPayload & ComicsPayload {
 *   token    - 访问令牌
 *   category - 分类名称（例如：'Cosplay'）
 *   page     - 页数（可选）
 *   sort     - 排序（可选）
 * }
 * @return ComicsResponse
 */
PicaComicAPI.fetchComics(payload: AuthorizationPayload & ComicsPayload): Promise<ComicsResponse>
```

### .fetchComicDetail

```typescript
/**
 * 使用给定的有效负载获取漫画详情。
 *
 * @param payload - AuthorizationPayload & ComicDetailPayload {
 *   token   - 访问令牌
 *   comicId - 漫画 ID
 * }
 * @return ComicDetailResponse
 */
PicaComicAPI.fetchComicDetail(payload: AuthorizationPayload & ComicDetailPayload): Promise<ComicDetailResponse>
```

### .fetchComicEpisodes

```typescript
/**
 * 使用给定的有效负载获取漫画分话。
 *
 * @param payload - AuthorizationPayload & ComicEpisodesPayload {
 *   token   - 访问令牌
 *   comicId - 漫画 ID
 *   page    - 页数（可选）
 * }
 * @return ComicEpisodesResponse
 */
PicaComicAPI.fetchComicEpisodes(payload: AuthorizationPayload & ComicEpisodesPayload): Promise<ComicEpisodesResponse>
```

### .fetchComicEpisodePages

```typescript
/**
 * 使用给定的有效负载获取指定漫画分话的页面。
 *
 * @param payload - AuthorizationPayload & ComicEpisodePagesPayload {
 *   token   - 访问令牌
 *   comicId - 漫画 ID
 *   order   - 漫画分话顺序
 *   page    - 页数（可选）
 * }
 * @return ComicEpisodePagesResponse
 */
PicaComicAPI.fetchComicEpisodePages(payload: AuthorizationPayload & ComicEpisodePagesPayload): Promise<ComicEpisodePagesResponse>
```

### .fetchComicComments

```typescript
/**
 * 使用给定的有效负载获取漫画评论。
 *
 * @param payload - AuthorizationPayload & ComicCommentsPayload {
 *   token   - 访问令牌
 *   comicId - 漫画 ID
 *   page    - 页数（可选）
 * }
 * @return ComicCommentsResponse
 */
PicaComicAPI.fetchComicComments(payload: AuthorizationPayload & ComicCommentsPayload): Promise<ComicComments>
```

### .searchComics

```typescript
/**
 * 使用给定的有效负载搜索漫画。
 *
 * @param payload - AuthorizationPayload & SearchComicsPayload {
 *   token      - 访问令牌
 *   keyword    - 关键字
 *   categories - 分类名称数组（例如：['Cosplay']）（可选）
 *   page       - 页数（可选）
 *   sort       - 排序（可选）
 * }
 * @return SearchComicsResponse
 */
PicaComicAPI.searchComics(payload: AuthorizationPayload & SearchComicsPayload): Promise<Comics>
```

### .switchComicLike

```typescript
/**
 * 使用给定的有效负载将漫画切换为喜欢或不喜欢。
 *
 * @param payload - AuthorizationPayload & ComicIdPayload {
 *   toke    - 访问令牌
 *   comicId - 漫画 ID
 * }
 * @return SwitchComicLikeResponse
 */
PicaComicAPI.switchComicLike(payload: AuthorizationPayload & ComicIdPayload): Promise<SwitchComicLikeResponse>
```

### .switchComicFavourite

```typescript
/**
 * 使用给定的有效负载将漫画切换为收藏或取消收藏。
 *
 * @param payload - AuthorizationPayload & ComicIdPayload {
 *   toke    - 访问令牌
 *   comicId - 漫画 ID
 * }
 * @return SwitchComicFavouriteResponse
 */
PicaComicAPI.switchComicFavourite(payload: AuthorizationPayload & ComicIdPayload): Promise<SwitchComicFavouriteResponse>
```

### .setUserProfileSlogan

```typescript
/**
 * 使用给定的有效负载设置用户档案的签名。
 *
 * @param payload - AuthorizationPayload & UserProfileSloganPayload {
 *   toke   - 访问令牌
 *   slogan - 签名（不能是空白的）
 * }
 * @return BaseResponse<undefined>
 */
PicaComicAPI.setUserProfileSlogan(payload: AuthorizationPayload & UserProfileSloganPayload): Promise<BaseResponse<undefined>>
```

## Client

服务只是对单个账户操作的封装，不需要自己去处理令牌失效的问题。

> 注意: 客户端类似 API，但是不提供 `register` 和 `signIn` 方法。其他方法的 `payload` 参数不需要再提供 `token` 访问令牌属性。

```typescript
import { PicaComicClient } from '@l2studio/picacomic-api'

export class PicaComicClient {
  public readonly email: string
  public readonly password: string
  public readonly api: PicaComicAPI
  public readonly onTokenIssued?: (token: string) => void | Promise<void>
  public token: string
  constructor (options: PicaComicClientOptions)
}
```

### Client Options

```typescript
interface PicaComicClientOptions extends Omit<PicaComicAPIOptions, 'reauthorizationTokenCallback'> {
  /// 继承于 PicaComicAPIOptions 选项
  /// 另见上
  fetch?: Got | ExtendOptions
  appOptions?: Partial<PicaComicOptions>
  ///

  /// 自有属性
  email: string         // PicaComic 哔咔账户邮箱
  password: string      //                  密码
  token?: string        //                  账户访问令牌（可选）

  // 当令牌无效时，用于重新认证和使用新令牌的回调函数。（可选）
  // 例子:
  //   onTokenIssued (token) {
  //     console.log('新的令牌:', token)
  //     fs.writeFileSync('token.txt', token)
  //   }
  onTokenIssued?: (token: string) => void | Promise<void>
}
```

### 例子

当令牌过期时，它将重新登录并更新令牌和持久化。无需每次都提供令牌。

```typescript
import { PicaComicClient } from '@l2studio/picacomic-api'
import path from 'path'
import fs from 'fs'

const tokenFile = path.join(__dirname, '.token') // 持久化令牌
const picacomic = new PicaComicClient({
  email   : 'your picacomic email',
  password: 'your picacomic password',
  token: fs.existsSync(tokenFile) ? fs.readFileSync(tokenFile, 'utf8') : undefined,
  onTokenIssued (token) {
    console.log('New token:', token)
    fs.writeFileSync(tokenFile, token) // 更新持久化令牌
  }
})

;(async () => {
  const comics = await picacomic.fetchComics({ category: 'Cosplay' })
  console.log(comics)
})()
```

## 协议

Apache-2.0
