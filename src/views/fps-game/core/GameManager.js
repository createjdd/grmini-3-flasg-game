/**
 * 游戏管理器
 * 协调各个系统，管理游戏状态
 */
import { EventEmitter } from './EventEmitter'

export class GameManager extends EventEmitter {
  constructor(scene, weaponSystem, aiSystem, physicsSystem, effectSystem, audioSystem) {
    super()
    this.scene = scene
    this.weaponSystem = weaponSystem
    this.aiSystem = aiSystem
    this.physicsSystem = physicsSystem
    this.effectSystem = effectSystem
    this.audioSystem = audioSystem

    // 游戏状态
    this.gameState = 'playing' // playing, paused, gameOver
    this.score = 0
    this.wave = 1
    this.enemiesKilled = 0

    // 设置物理系统事件监听
    this.setupEventListeners()
  }

  setupEventListeners() {
    // 监听敌人被击杀
    this.physicsSystem.on('enemyHit', (data) => {
      if (data.killed) {
        this.enemiesKilled++
        this.score += 100
        this.emit('scoreChanged', { score: this.score })
      }
    })

    // 监听环境命中
    this.physicsSystem.on('environmentHit', (data) => {
      this.effectSystem.createBulletHole(data.point, data.normal, data.object)
    })
  }

  /**
   * 更新游戏管理器
   */
  update(delta, playerPosition) {
    // 更新AI系统的玩家位置
    if (this.aiSystem) {
      this.aiSystem.updatePlayerPosition(playerPosition)
    }
  }

  /**
   * 暂停游戏
   */
  pause() {
    this.gameState = 'paused'
    this.emit('gamePaused')
  }

  /**
   * 恢复游戏
   */
  resume() {
    this.gameState = 'playing'
    this.emit('gameResumed')
  }

  /**
   * 游戏结束
   */
  gameOver() {
    this.gameState = 'gameOver'
    this.emit('gameOver', { score: this.score })
  }

  /**
   * 重置游戏
   */
  reset() {
    this.score = 0
    this.wave = 1
    this.enemiesKilled = 0
    this.gameState = 'playing'
  }
}
