- **English**
- [简体中文](README-CN.md)

# L2 Studio - PicaComic API

<p>
<a href="https://github.com/l2studio/picacomic-api/actions"><img src="https://img.shields.io/github/actions/workflow/status/l2studio/picacomic-api/ci.yml?branch=main&logo=github&style=flat-square"/></a>
<a href="https://www.npmjs.com/package/@l2studio/picacomic-api"><img src="https://img.shields.io/npm/v/@l2studio/picacomic-api?logo=npm&style=flat-square"/></a>
</p>

A library for PicaComic http web api

## Install

```shell
npm install --save @l2studio/picacomic-api
# or
pnpm i @l2studio/picacomic-api
```

## API

> Currently the API documentation for version 0.2.x. See also [old documentation](https://github.com/l2studio/picacomic-api/tree/0.1.13#readme).

**The v0.2.x is a breaking update, but more specific to type definitions. and code refactoring and optimization.**

```typescript
import { PicaComicAPI } from '@l2studio/picacomic-api'

class PicaComicAPI {
  public readonly fetch: Got
  public readonly appOptions?: Partial<PicaComicOptions>
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
  // Got instance or options (optional)
  // See: https://github.com/sindresorhus/got/tree/v11
  fetch?: Got | ExtendOptions

  // PicaComic app client options (optional)
  // See above: PicaComicOptions
  appOptions?: Partial<PicaComicOptions>

  // Callback function used to re-authenticate and return a new token when the token is invalid. (optional)
  // Example:
  //   async reauthorizationTokenCallback (self) {
  //     console.log('Token invalid, re-authenticate...')
  //     const response = await self.signIn({
  //       email   : 'your picacomic account email',
  //       password: 'your picacomic account password'
  //     })
  //     return response.data.token
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
 * Register a PicaComic account with the given payload.
 *
 * @param payload - RegisterPayload {
 *   name      - Nickname (2 - 50 characters)
 *   email     - Email (Allow: [0-9 a-z . _])
 *   password  - Password (Greater than 8 characters)
 *   question1 - Security Question 1
 *   question2 -                   2
 *   question3 -                   3
 *   answer1   - Security question 1 answer
 *   answer2   -                   2 answer
 *   answer3   -                   3 answer
 *   birthday  - Birthday ('YYYY-MM-DD' | Date | Milliseconds) Need to be 18 years or older
 *   gender    - Gender ('m' | 'f' | 'bot')
 * }
 * @return BaseResponse<undefined>
 */
PicaComicAPI.register(payload: RegisterPayload): Promise<BaseResponse<undefined>>
```

### .signIn

```typescript
/**
 * Sign in to the PicaComic account with the given payload.
 *
 * @param payload - SignInPayload {
 *   email    - Your PicaComic account email
 *   password -                        password
 * }
 * @return SignInResponse
 */
PicaComicAPI.signIn(payload: SignInPayload): Promise<SignInResponse>
```

### .punchIn

```typescript
/**
 * Punch in to the PicaComic account with the given payload.
 *
 * @param payload - AuthorizationPayload { token - Access token }
 * @return PunchInResponse
 */
PicaComicAPI.punchIn(payload: AuthorizationPayload): Promise<PunchInResponse>
```

### .fetchUserProfile

```typescript
/**
 * Fetch user profile using the given payload.
 *
 * @param payload - AuthorizationPayload { token - Access token }
 * @return UserProfileResponse
 */
PicaComicAPI.fetchUserProfile(payload: AuthorizationPayload): Promise<UserProfileResponse>
```

### .fetchUserFavourite

```typescript
/**
 * Fetch user favourite comics using the given payload.
 *
 * @param payload - AuthorizationPayload & UserFavouritePayload {
 *   token - Access token
 *   page  - Page number (optional)
 *   sort  - Sorting type (optional)
 * }
 * @return UserFavouriteResponse
 */
PicaComicAPI.fetchUserFavourite(payload: AuthorizationPayload & UserFavouritePayload): Promise<UserFavouriteResponse>
```

### .fetchCategories

```typescript
/**
 * Fetch all categories using the given payload.
 *
 * @param payload - AuthorizationPayload { token - Access token }
 * @return CategoriesResponse
 */
PicaComicAPI.fetchCategories(payload: AuthorizationPayload): Promise<CategoriesResponse>
```

### .fetchComics

```typescript
/**
 * Fetch comics using the given payload.
 *
 * @param payload -  AuthorizationPayload & ComicsPayload {
 *   token    - Access token
 *   category - Specify category name (e.g.: 'Cosplay')
 *   page     - Page number (optional)
 *   sort     - Sorting type (optional)
 * }
 * @return ComicsResponse
 */
PicaComicAPI.fetchComics(payload: AuthorizationPayload & ComicsPayload): Promise<ComicsResponse>
```

### .fetchComicDetail

```typescript
/**
 * Fetch comic detail using the given payload.
 *
 * @param payload - AuthorizationPayload & ComicDetailPayload {
 *   token   - Access token
 *   comicId - Specify comic id
 * }
 * @return ComicDetailResponse
 */
PicaComicAPI.fetchComicDetail(payload: AuthorizationPayload & ComicDetailPayload): Promise<ComicDetailResponse>
```

### .fetchComicEpisodes

```typescript
/**
 * Fetch comic episodes using the given payload.
 *
 * @param payload - AuthorizationPayload & ComicEpisodesPayload {
 *   token   - Access token
 *   comicId - Specify comic id
 *   page    - Page number (optional)
 * }
 * @return ComicEpisodesResponse
 */
PicaComicAPI.fetchComicEpisodes(payload: AuthorizationPayload & ComicEpisodesPayload): Promise<ComicEpisodesResponse>
```

### .fetchComicEpisodePages

```typescript
/**
 * Fetch pages of the specified comic episode using the given payload.
 *
 * @param payload - AuthorizationPayload & ComicEpisodePagesPayload {
 *   token   - Access token
 *   comicId - Specify comic id
 *   order   - Specify episode order of the comic
 *   page    - Page number (optional)
 * }
 * @return ComicEpisodePagesResponse
 */
PicaComicAPI.fetchComicEpisodePages(payload: AuthorizationPayload & ComicEpisodePagesPayload): Promise<ComicEpisodePagesResponse>
```

### .fetchComicComments

```typescript
/**
 * Fetch comic comments using the given payload.
 *
 * @param payload - AuthorizationPayload & ComicCommentsPayload {
 *   token   - Access token
 *   comicId - Specify comic id
 *   page    - Page number (optional)
 * }
 * @return ComicCommentsResponse
 */
PicaComicAPI.fetchComicComments(payload: AuthorizationPayload & ComicCommentsPayload): Promise<ComicComments>
```

### .searchComics

```typescript
/**
 * Search comics using the given payload.
 *
 * @param payload - AuthorizationPayload & SearchComicsPayload {
 *   token      - Access token
 *   keyword    - Keyword
 *   categories - Specify category name array (e.g.: ['Cosplay']) (optional)
 *   page       - Page number (optional)
 *   sort       - Sorting type (optional)
 * }
 * @return SearchComicsResponse
 */
PicaComicAPI.searchComics(payload: AuthorizationPayload & SearchComicsPayload): Promise<Comics>
```

### .switchComicLike

```typescript
/**
 * Switch the comic as like or unlike using the given payload.
 *
 * @param payload - AuthorizationPayload & ComicIdPayload {
 *   toke    - Access token
 *   comicId - Specify comic id
 * }
 * @return SwitchComicLikeResponse
 */
PicaComicAPI.switchComicLike(payload: AuthorizationPayload & ComicIdPayload): Promise<SwitchComicLikeResponse>
```

### .switchComicFavourite

```typescript
/**
 * Switch the comic as favourite or un_favourite using the given payload.
 *
 * @param payload - AuthorizationPayload & ComicIdPayload {
 *   toke    - Access token
 *   comicId - Specify comic id
 * }
 * @return SwitchComicFavouriteResponse
 */
PicaComicAPI.switchComicFavourite(payload: AuthorizationPayload & ComicIdPayload): Promise<SwitchComicFavouriteResponse>
```

### .setUserProfileSlogan

```typescript
/**
 * Set the slogan of the user profile with the given payload.
 *
 * @param payload - AuthorizationPayload & UserProfileSloganPayload {
 *   toke   - Access token
 *   slogan - Slogan (Cannot be blank)
 * }
 * @return BaseResponse<undefined>
 */
PicaComicAPI.setUserProfileSlogan(payload: AuthorizationPayload & UserProfileSloganPayload): Promise<BaseResponse<undefined>>
```

### .stringifyImageUrl

```typescript
/**
 * Stringify the given image media data into image url.
 *
 * @param payload - ImageMediaPayload = ImageMedia | {
 *   path       - Path name
 *   fileServer - File server (Optional)
 * }
 * @return string
 */
PicaComicAPI.stringifyImageUrl(payload: ImageMediaPayload): string
```

### .createImageRequest

```typescript
/**
 * Create an image request from the given image media data.
 *
 * @param payload - ImageMediaPayload = ImageMedia | {
 *   path       - Path name
 *   fileServer - File server (Optional)
 * }
 * @return Request (Got request)
 */
PicaComicAPI.createImageRequest(payload: ImageMediaPayload): got.Request
```

### .createImageRequestAsBuffer

```typescript
/**
 * Create an image request and as buffer from the given image media data.
 *
 * @param payload - ImageMediaPayload = ImageMedia | {
 *   path       - Path name
 *   fileServer - File server (Optional)
 * }
 * @return Buffer
 */
PicaComicAPI.createImageRequestAsBuffer(payload: ImageMediaPayload): Promise<Buffer>
```

## Client

The client is just a wrapper for a single account operation, and does not need to handle the problem of token invalidation by itself.

> Note: The client is similar to the API, but does not provide `register` and `signIn` methods. The `payload` parameters of other methods do not need to provide the `token` access token property.

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
  /// Extende PicaComicAPIOptions options
  /// See above
  fetch?: Got | ExtendOptions
  appOptions?: Partial<PicaComicOptions>
  ///

  // Owned options
  email: string         // PicaComic account email
  password: string      // PicaComic account password
  token?: string        // PicaComic account access token (Optional)

  // Callback function for re-authenticate and consuming a new token when the token is invalid. (Optional)
  // Example:
  //   onTokenIssued (token) {
  //     console.log('New token:', token)
  //     fs.writeFileSync('token.txt', token)
  //   }
  onTokenIssued?: (token: string) => void | Promise<void>
}
```

### Example

When the token expires, it will re-login and renew the token and persistence. No need to provide token every time.

```typescript
import { PicaComicClient } from '@l2studio/picacomic-api'
import path from 'path'
import fs from 'fs'

const tokenFile = path.join(__dirname, '.token') // Persistent token
const picacomic = new PicaComicClient({
  email   : 'your picacomic email',
  password: 'your picacomic password',
  token: fs.existsSync(tokenFile) ? fs.readFileSync(tokenFile, 'utf8') : undefined,
  onTokenIssued (token) {
    console.log('New token:', token)
    fs.writeFileSync(tokenFile, token) // Update persistent token
  }
})

;(async () => {
  const response = await picacomic.fetchComics({ category: 'Cosplay' })
  console.log(response)
})()
```

## FAQ

### How to configure http proxy

> See also Got [agent](https://github.com/sindresorhus/got/tree/v11#agent).

Please configure the `fetch` property of [`PicaComicAPIOptions`](#api-options) or [`PicaComicClientOptions`](#client-options).

Example using [tunnel](https://github.com/koichik/node-tunnel):

```typescript
import { PicaComicClient } from '@l2studio/picacomic-api'
import tunnel from 'tunnel'

const picacomic = new PicaComicClient({
  fetch: {
    agent: {
      https: tunnel.httpsOverHttp({
        // Your http proxy server host and port
        proxy: {
          host: '127.0.0.1',
          port: 10809
        }
      }) as any
    }
  },
  ...other
})
```

## License

Apache-2.0
