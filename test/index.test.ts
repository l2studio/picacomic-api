import PicaComic from '../src'
import tunnel from 'tunnel'

const useProxy = true
const picaComic = new PicaComic({
  reqConfig: {
    httpsAgent: !useProxy
      ? undefined
      : tunnel.httpsOverHttp({
        proxy: {
          host: '127.0.0.1',
          port: 10809
        }
      })
  }
})

test('test', async () => {
  jest.setTimeout(30000)
  // const token = await picaComic.signIn('email', 'password')
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Zjc5YjdlNmEzOTljMjBlMjdmYmY3MmYiLCJlbWFpbCI6Inl5bW9vbmxha2UiLCJyb2xlIjoibWVtYmVyIiwibmFtZSI6Inl5bW9vbmxha2UiLCJ2ZXJzaW9uIjoiMi4yLjEuMi4zLjMiLCJidWlsZFZlcnNpb24iOiI0NCIsInBsYXRmb3JtIjoiYW5kcm9pZCIsImlhdCI6MTYwMzAyNjU4OCwiZXhwIjoxNjAzNjMxMzg4fQ.8IR7N19KVBdV5g09sdZ94SMNUIE1ysVdcgBSuzwH8DM'
  const data = await picaComic.comics(token, { page: 1, c: 'Cosplay', s: 'ua' })
  console.log(JSON.stringify(data))
})
