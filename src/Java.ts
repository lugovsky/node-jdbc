import * as j from 'java'
import * as deasync from 'deasync'
import * as debug from 'debug'

import { EventEmitter } from 'events'
import { JavaAPI } from './types/JavaApi'
import { fromNodeCallback } from './utils/fromNodeCallback'

const java: JavaAPI = Object.assign(j, {
  newInstanceAsync (className: string, ...args: unknown[]) {
    return fromNodeCallback((callback) => j.newInstance(className, ...args, callback))
  },
  callStaticMethodAsync (className: string, methodName: string, ...args: unknown[]) {
    return fromNodeCallback((callback) => j.callStaticMethod(className, methodName, ...args, callback))
  }
})

let instance: Java = null

export class Java {
  public java: JavaAPI
  public events: EventEmitter

  public mavenClasspath: string[] = []
  public mavenDependencies: {} = {}

  protected _debug: debug.IDebugger = debug('jdbc:Java')

  constructor (useXrs: boolean = true, useMaven: boolean = true) {
    if (instance) {
      return instance
    }

    instance = this

    this.java = java
    this.events = new EventEmitter()

    if (useXrs) {
      this._debug('use Xrs')
      this.addOption('-Xrs')
    }

    if (useMaven) {
      try {
        let done: boolean = false
        const mvn = require('node-java-maven')
        mvn((err: Error, deps) => {
          if (err) throw err
          this.mavenClasspath = deps.classpath
          this.mavenDependencies = deps.dependencies
          done = true
        })
        deasync.loopWhile(() => !done)
        this.addClasspath(this.mavenClasspath)
      } catch (err) {
        if (err.code !== 'MODULE_NOT_FOUND') {
          throw err
        } else {
          this._debug('node-jave-maven not found. useMaven is ignored.')
        }
      }
    }

    return instance
  }

  static getInstance (): Java {
    if (!instance) {
      instance = new Java()
    }
    return instance
  }

  isJvmCreated (): boolean {
    return this.java.isJvmCreated()
  }

  addOption (option: string) {
    if (this.isJvmCreated() === false) {
      this.java.options.push(option)
    } else {
      throw new Error(`Can not add option '${option}', because JVM instance is already created`)
    }
  }

  addClasspath (dependencies: string[]) {
    if (this.isJvmCreated() === false) {
      this.java.classpath.push.apply(this.java.classpath, dependencies)
    } else {
      throw new Error(`Can not add classpath dependencies, because JVM instance is already created.\n\nDependencies: ${dependencies}`)
    }
  }
}
