/**
 * 简单的事件发射器
 * 用于系统间通信
 */
export class EventEmitter {
  constructor() {
    this.events = {}
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(callback)
  }

  off(event, callback) {
    if (!this.events[event]) return

    this.events[event] = this.events[event].filter((cb) => cb !== callback)
  }

  emit(event, data) {
    if (!this.events[event]) return

    this.events[event].forEach((callback) => {
      callback(data)
    })
  }
}
