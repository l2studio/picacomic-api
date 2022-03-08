# L2 Studio - PicaComic API

<p>
<a href="https://github.com/l2studio/picacomic-api/actions"><img src="https://img.shields.io/github/workflow/status/l2studio/picacomic-api/CI?logo=github&style=flat-square"/></a>
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

By default, the constructor does not need parameters.

```typescript
import { PicaComicAPI } from '@l2studio/picacomic-api'

class PicaComicAPI(opts?: Partial<Options>)
```

### Options

```typescript
type Options = {
  timeout?: number // http request timeout (optional)
  proxy?: {        // http proxy (optional)
    host: string   //      proxy host (required)
    port: number   //      porxy port (required)
  }
  app?: {          // PicaComic app client options (optional)
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
  // Callback function used to re-authenticate and return a new token when the token is invalid. (optional)
  // Example:
  //   async reauthorizationTokenCallback (self) {
  //     console.log('Token invalid, re-authenticate...')
  //     return await self.signIn({
  //       email   : 'your picacomic account email',
  //       password: 'your picacomic account password'
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

### .register

```typescript
/**
 * Register a PicaComic account with the given payload.
 *
 * @param payload - {
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

### .signIn

```typescript
/**
 * Sign in to the PicaComic account with the given email and password payload.
 *
 * @param payload - Email and password payload
 * @return Access token
 */
PicaComicAPI.prototype.signIn(payload: { email: string, password: string }): Promise<string>
```

### .punchIn

```typescript
/**
 * Punch in to the PicaComic account with the given access token payload.
 *
 * @param payload - Access token payload
 * @return PunchInResponse
 */
PicaComicAPI.prototype.punchIn(payload: { email: string, password: string }): Promise<PunchInResponse>
```

### .fetchUserProfile

```typescript
/**
 * Fetch user profile using the given access token payload.
 *
 * @param payload - Access token payload
 * @return User
 */
PicaComicAPI.prototype.fetchUserProfile(payload: { token: string }): Promise<User>
```

### .fetchUserFavourite

```typescript
/**
 * Fetch user favourite comics using the given payload.
 *
 * @param payload - {
 *   token    - Access token
 *   page     - Page number (optional)
 *   sort     - Sorting type (optional)
 * }
 * @return Comics
 */
PicaComicAPI.prototype.fetchUserFavourite(payload: { token: string, page?: number, sort?: 'ua' | 'dd' | 'da' | 'ld' | 'vd' }): Promise<Comics>
```

### .fetchCategories

```typescript
/**
 * Fetch all categories using the given access token payload.
 *
 * @param payload - Access token payload
 * @return Category[]
 */
PicaComicAPI.prototype.fetchCategories(payload: { token: string }): Promise<Category[]>
```

### .fetchComics

```typescript
/**
 * Fetch comics using the given payload.
 *
 * @param payload - {
 *   token    - Access token
 *   category - Specify category name (e.g.: 'Cosplay')
 *   page     - Page number (optional)
 *   sort     - Sorting type (optional)
 * }
 * @return Comics
 */
PicaComicAPI.prototype.fetchComics(payload: { token: string, category: string, page?: number, sort?: 'ua' | 'dd' | 'da' | 'ld' | 'vd' }): Promise<Comics>
```

### .fetchComic

```typescript
/**
 * Fetch comic info using the given payload.
 *
 * @param payload - {
 *   token - Access token
 *   id    - Specify comic id
 * }
 * @return ComicInfo
 */
PicaComicAPI.prototype.fetchComic(payload: { token: string, id: string }): Promise<ComicInfo>
```

### .fetchComicComments

```typescript
/**
 * Fetch comic comments using the given payload.
 *
 * @param payload - {
 *   token   - Access token
 *   comicId - Specify comic id
 *   page    - Page number (optional)
 * }
 * @return ComicComments
 */
PicaComicAPI.prototype.fetchComicComments(payload: { token: string, comicId: string, page?: number }): Promise<ComicComments>
```

### .fetchComicEpisodes

```typescript
/**
 * Fetch comic episodes using the given payload.
 *
 * @param payload - {
 *   token   - Access token
 *   comicId - Specify comic id
 *   page    - Page number (optional)
 * }
 * @return ComicEpisodes
 */
PicaComicAPI.prototype.fetchComicEpisodes(payload: { token: string, comicId: string, page?: number }): Promise<ComicEpisodes>
```

### .fetchComicEpisodePages

```typescript
/**
 * Fetch pages of the specified comic episode using the given payload.
 *
 * @param payload - {
 *   token    - Access token
 *   comicId  - Specify comic id
 *   epsOrder - Specify episode order of the comic
 *   page     - Page number (optional)
 * }
 * @return ComicEpisodePages
 */
PicaComicAPI.prototype.fetchComicEpisodePages(payload: { token: string, comicId: string, epsOrder: number, page?: number }): Promise<ComicEpisodePages>
```

### .stringifyImageUrl


```typescript
/**
 * Stringify the given media image data into image url.
 *
 * @param payload - {
 *   path       - Path name
 *   fileServer - File server (Optional)
 * }
 * @return Stringify image url
 */
PicaComicAPI.prototype.stringifyImageUrl(payload: { path: string, fileServer?: string }): string
```

### .fetchImage

```typescript
/**
 * Fetch image from the given media image data.
 *
 * @param payload - {
 *   path       - Path name
 *   fileServer - File server (Optional)
 * }
 * @return Duplex (Got stream)
 */
PicaComicAPI.prototype.fetchImage(payload: { path: string, fileServer?: string }): Promise<Duplex>
```

### .search

```typescript
/**
 * Search comics using the given payload.
 *
 * @param payload - {
 *   token      - Access token
 *   keyword    - Keyword
 *   categories - Specify category name array (e.g.: ['Cosplay']) (optional)
 *   page       - Page number (optional)
 *   sort       - Sorting type (optional)
 * }
 * @return Comics
 */
PicaComicAPI.prototype.search(payload: { token: string, keyword: string, categories?: string[], page?: number, sort?: 'ua' | 'dd' | 'da' | 'ld' | 'vd' }): Promise<Comics>
```

### .switchComicLike

```typescript
/**
 * Switch the comic as like or unlike using the given payload.
 *
 * @param payload - {
 *   toke  - Access token
 *   id    - Comic id
 * }
 * @return 'like' | 'unlike'
 */
PicaComicAPI.prototype.switchComicLike(payload: { token: string, id: string }): Promise<'like' | 'unlike'>
```

### .switchComicFavourite

```typescript
/**
 * Switch the comic as favourite or un_favourite using the given payload.
 *
 * @param payload - {
 *   toke  - Access token
 *   id    - Comic id
 * }
 * @return 'favourite' | 'un_favourite'
 */
PicaComicAPI.prototype.switchComicFavourite(payload: { token: string, id: string }): Promise<'favourite' | 'un_favourite'>
```

### .setUserProfileSlogan

```typescript
/**
 * Set the slogan of the user profile with the given payload.
 *
 * @param payload - {
 *   toke   - Access token
 *   slogan - Slogan (Cannot be blank)
 * }
 * @return Response
 */
PicaComicAPI.prototype.setUserProfileSlogan(payload: { token: string, slogan: string }): Promise<Response<void>>
```

## License

Apache-2.0
