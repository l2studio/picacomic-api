import { AxiosError } from 'axios'

class PicaComicError extends Error {
  constructor (
    public readonly code: string,
    public readonly detail: string,
    message?: string
  ) {
    super(message)
    this.name = 'PicaComicError'
  }

  static capture (e: AxiosError | any): never {
    if (e.response && e.response.data && e.response.data.error) {
      const { error, detail, message } = e.response.data
      throw new PicaComicError(error, detail, message)
    } else {
      throw new PicaComicError('-1', 'Internal error', e.message)
    }
  }
}

export default PicaComicError
