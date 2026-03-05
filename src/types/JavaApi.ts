import * as Promise from 'bluebird'
import * as j from 'java'

export type JavaCore = typeof j
export type JavaAsync = {
  newInstanceAsync: (...args: Parameters<JavaCore['newInstanceSync']>) => Promise<ReturnType<JavaCore['newInstanceSync']>>
  callStaticMethodAsync: (...args: Parameters<JavaCore['callStaticMethodSync']>) => Promise<ReturnType<JavaCore['callStaticMethodSync']>>
}
export type JavaAPI = JavaCore & JavaAsync
