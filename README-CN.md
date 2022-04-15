- [English](README.md)
- **简体中文**

# L2 Studio - PicaComic API

<p>
<a href="https://github.com/l2studio/picacomic-api/actions"><img src="https://img.shields.io/github/workflow/status/l2studio/picacomic-api/CI?logo=github&style=flat-square"/></a>
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

构造方法默认不需要参数。

```typescript
import { PicaComicAPI } from '@l2studio/picacomic-api'

class PicaComicAPI(opts?: Partial<Options>) {
  public readonly fetch: typeof got
  public readonly options: Readonly<Options>
}
```

### 选项

```typescript
type Options = {
  timeout?: number // HTTP 请求超时（可选）
  proxy?: {        // HTTP 代理（可选）
    host: string   //      代理主机（可选）
    port: number   //      代理端口（可选）
  }
  app?: {          // PicaComic app 客户端选项（可选）
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
  // 用于在令牌无效时重新认证并返回新令牌的回调函数。（可选的）
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
  readonly cause: got.HttpError | Error
  readonly code: number
  readonly error: string
  readonly message: string
  readonly detail?: string
}
```

<details>
<summary>.register</summary>

```typescript
/**
 * 使用给定的有效负载注册一个 PicaComic 哔咔帐户。
 *
 * @param payload - {
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
 * @return Response
 */
PicaComicAPI.prototype.register(payload: {
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
}): Promise<Response<void>>
```

</details>

<details>
<summary>.signIn</summary>

```typescript
/**
 * 使用给定的电子邮件和密码有效负载登录到 PicaComic 哔咔帐户。
 *
 * @param payload - 电子邮件和密码
 * @return 访问令牌
 */
PicaComicAPI.prototype.signIn(payload: { email: string, password: string }): Promise<string>
```

</details>

<details>
<summary>.punchIn</summary>

```typescript
/**
 * 使用给定的访问令牌有效负载打卡 PicaComic 哔咔帐户。
 *
 * @param payload - 访问令牌
 * @return PunchInResponse
 */
PicaComicAPI.prototype.punchIn(payload: { token: string }): Promise<PunchInResponse>
```

</details>

<details>
<summary>.fetchUserProfile</summary>

```typescript
/**
 * 使用给定的访问令牌有效负载获取用户档案。
 *
 * @param payload - 访问令牌
 * @return User
 */
PicaComicAPI.prototype.fetchUserProfile(payload: { token: string }): Promise<User>
```

</details>

<details>
<summary>.fetchUserFavourite</summary>

```typescript
/**
 * 使用给定的有效负载获取用户收藏的漫画。
 *
 * @param payload - {
 *   token    - 访问令牌
 *   page     - 页数（可选）
 *   sort     - 排序（可选）
 * }
 * @return Comics
 */
PicaComicAPI.prototype.fetchUserFavourite(payload: { token: string, page?: number, sort?: ComicSort }): Promise<Comics>
```

</details>

<details>
<summary>.fetchCategories</summary>

```typescript
/**
 * 使用给定的访问令牌有效负载获取所有分类。
 *
 * @param payload - 访问令牌
 * @return Category[]
 */
PicaComicAPI.prototype.fetchCategories(payload: { token: string }): Promise<Category[]>
```

</details>

<details>
<summary>.fetchComics</summary>

```typescript
/**
 * 使用给定的有效负载获取漫画。
 *
 * @param payload - {
 *   token    - 访问令牌
 *   category - 分类名称（例如：'Cosplay'）
 *   page     - 页数（可选）
 *   sort     - 排序（可选）
 * }
 * @return Comics
 */
PicaComicAPI.prototype.fetchComics(payload: { token: string, category: string, page?: number, sort?: ComicSort }): Promise<Comics>
```

</details>

<details>
<summary>.fetchComic</summary>

```typescript
/**
 * 使用给定的有效负载获取漫画信息。
 *
 * @param payload - {
 *   token - 访问令牌
 *   id    - 漫画 ID
 * }
 * @return ComicInfo
 */
PicaComicAPI.prototype.fetchComic(payload: { token: string, id: string }): Promise<ComicInfo>
```

</details>

<details>
<summary>.fetchComicComments</summary>

```typescript
/**
 * 使用给定的有效负载获取漫画评论。
 *
 * @param payload - {
 *   token   - 访问令牌
 *   comicId - 漫画 ID
 *   page    - 页数（可选）
 * }
 * @return ComicComments
 */
PicaComicAPI.prototype.fetchComicComments(payload: { token: string, comicId: string, page?: number }): Promise<ComicComments>
```

</details>

<details>
<summary>.fetchComicEpisodes</summary>

```typescript
/**
 * 使用给定的有效负载获取漫画分话。
 *
 * @param payload - {
 *   token   - 访问令牌
 *   comicId - 漫画 ID
 *   page    - 页数（可选）
 * }
 * @return ComicEpisodes
 */
PicaComicAPI.prototype.fetchComicEpisodes(payload: { token: string, comicId: string, page?: number }): Promise<ComicEpisodes>
```

</details>

<details>
<summary>.fetchComicEpisodePages</summary>

```typescript
/**
 * 使用给定的有效负载获取指定漫画分话的页面。
 *
 * @param payload - {
 *   token    - 访问令牌
 *   comicId  - 漫画 ID
 *   epsOrder - 漫画分话顺序
 *   page     - 页数（可选）
 * }
 * @return ComicEpisodePages
 */
PicaComicAPI.prototype.fetchComicEpisodePages(payload: { token: string, comicId: string, epsOrder: number, page?: number }): Promise<ComicEpisodePages>
```

</details>

<details>
<summary>.stringifyImageUrl</summary>

```typescript
/**
 * 将给定的媒体图像数据字符串化为图像 URL 链接。
 *
 * @param payload - {
 *   path       - 路径名称
 *   fileServer - 文件服务器（可选）
 * }
 * @return 字符串化图片地址
 */
PicaComicAPI.prototype.stringifyImageUrl(payload: { path: string, fileServer?: string }): string
```

</details>

<details>
<summary>.fetchImage</summary>

```typescript
/**
 * 从给定的媒体图像数据中获取图像数据流。
 *
 * @param payload - {
 *   path       - 路径名称
 *   fileServer - 文件服务器（可选）
 * }
 * @return Duplex (Got stream)
 */
PicaComicAPI.prototype.fetchImage(payload: { path: string, fileServer?: string }): Promise<Duplex>
```

</details>

<details>
<summary>.search</summary>

```typescript
/**
 * 使用给定的有效负载搜索漫画。
 *
 * @param payload - {
 *   token      - 访问令牌
 *   keyword    - 关键字
 *   categories - 分类名称数组（例如：['Cosplay']）（可选）
 *   page       - 页数（可选）
 *   sort       - 排序（可选）
 * }
 * @return SearchedComics
 */
PicaComicAPI.prototype.search(payload: { token: string, keyword: string, categories?: string[], page?: number, sort?: ComicSort }): Promise<SearchedComics>
```

</details>

<details>
<summary>.switchComicLike</summary>

```typescript
/**
 * 使用给定的有效负载将漫画切换为喜欢或不喜欢。
 *
 * @param payload - {
 *   toke  - 访问令牌
 *   id    - 漫画 ID
 * }
 * @return 'like' | 'unlike'
 */
PicaComicAPI.prototype.switchComicLike(payload: { token: string, id: string }): Promise<'like' | 'unlike'>
```

</details>

<details>
<summary>.switchComicFavourite</summary>

```typescript
/**
 * 使用给定的有效负载将漫画切换为收藏或取消收藏。
 *
 * @param payload - {
 *   toke  - 访问令牌
 *   id    - 漫画 ID
 * }
 * @return 'favourite' | 'un_favourite'
 */
PicaComicAPI.prototype.switchComicFavourite(payload: { token: string, id: string }): Promise<'favourite' | 'un_favourite'>
```

</details>

<details>
<summary>.setUserProfileSlogan</summary>

```typescript
/**
 * 使用给定的有效负载设置用户档案的签名。
 *
 * @param payload - {
 *   toke   - 访问令牌
 *   slogan - 签名（不能是空白的）
 * }
 * @return Response
 */
PicaComicAPI.prototype.setUserProfileSlogan(payload: { token: string, slogan: string }): Promise<Response<void>>
```

</details>

## 服务

服务只是对单个账户操作的封装，不需要自己去处理令牌失效的问题。

> 注意：服务不提供 `register` 和 `signIn` 方法。

```typescript
import { PicaComicService } from '@l2studio/picacomic-api'

class PicaComicService(opts: ServiceOptions) {
  public readonly api: PicaComicAPI
  public readonly email: string
  public readonly password: string
  public readonly onReauthorizationToken?: (token: string) => void | Promise<void>
  public token: string
}
```

### 选项

```typescript
type ServiceOptions = Partial<Omit<Options, 'reauthorizationTokenCallback'>> & {
  email: string         // PicaComic 哔咔账户邮箱
  password: string      // PicaComic 哔咔账户密码
  token?: string        // PicaComic 账户访问令牌（可选）
  // 当令牌无效时，用于重新认证和使用新令牌的回调函数。（可选）
  // 例子:
  //   onReauthorizationToken (token) {
  //     console.log('新的令牌:', token)
  //     fs.writeFileSync('token.txt', token)
  //   }
  onReauthorizationToken?: (token: string) => void | Promise<void>
}
```

### 例子

当令牌过期时，它将重新登录并更新令牌和持久化。无需每次都提供令牌。

```typescript
import { PicaComicService } from '@l2studio/picacomic-api'
import path from 'path'
import fs from 'fs'

const tokenFile = path.join(__dirname, '.token') // 持久化令牌
const picacomic = new PicaComicService({
  email   : '你的 PicaComic 哔咔账户邮箱',
  password: '你的 PicaComic 哔咔账户密码',
  token: fs.readFileSync(tokenFile, 'utf8'),
  onReauthorizationToken (token) {
    console.log('新的令牌:', token)
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
