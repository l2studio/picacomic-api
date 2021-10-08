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
  reauthorizationTokenCallback?: (self: PicaComicAPI) => string | Promise<string>
}
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
PicaComicAPI.prototype.fetchComics(payload: { token: string, id: string }): Promise<ComicInfo>
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
 *   fileServer - File server
 *   path       - Path name
 * }
 * @return Stringify image url
 */
PicaComicAPI.prototype.stringifyImageUrl(payload: { fileServer: string, path: string }): string
```

### .fetchImage

```typescript
/**
 * Fetch image from the given media image data.
 *
 * @param payload - {
 *   fileServer - File server
 *   path       - Path name
 * }
 * @return Duplex (Got stream)
 */
PicaComicAPI.prototype.fetchImage(payload: { fileServer: string, path: string }): Promise<Duplex>
```

## License

Apache-2.0
