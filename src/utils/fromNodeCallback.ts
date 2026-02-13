import * as Promise from 'bluebird'

export function fromNodeCallback<T> (
  executor: (callback: (err: Error | null | undefined, result: T) => void) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    executor((err, result) => err ? reject(err) : resolve(result))
  })
}
