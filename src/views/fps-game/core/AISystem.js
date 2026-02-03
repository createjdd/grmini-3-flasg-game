/**
 * AI系统
 * 处理敌人AI行为（巡逻、攻击、寻路等）
 */
import * as THREE from 'three'
import { EventEmitter } from './EventEmitter'

export class AISystem extends EventEmitter {
  constructor(scene, physicsSystem, effectSystem, audioSystem) {
    super()
    this.scene = scene
    this.physicsSystem = physicsSystem
    this.effectSystem = effectSystem
    this.audioSystem = audioSystem

    this.enemies = []
    this.enemyIdCounter = 0
    this.playerPosition = new THREE.Vector3(0, 1.6, 0)
  }

  /**
   * 生成敌人
   */
  spawnEnemies(count) {
    for (let i = 0; i < count; i++) {
      this.spawnEnemy()
    }
  }

  /**
   * 生成单个敌人
   */
  spawnEnemy() {
    const enemyId = this.enemyIdCounter++
    const enemy = new Enemy(enemyId, this.scene, this.physicsSystem, this.effectSystem, this.audioSystem)

    // 随机位置生成
    const angle = Math.random() * Math.PI * 2
    const distance = 20 + Math.random() * 30
    enemy.mesh.position.set(
      Math.cos(angle) * distance,
      1.6,
      Math.sin(angle) * distance
    )

    this.enemies.push(enemy)
    this.physicsSystem.registerEnemy(enemyId, enemy)

    // 监听敌人事件
    enemy.on('killed', () => {
      this.emit('enemyKilled', { enemyId })
      this.removeEnemy(enemyId)
    })
  }

  /**
   * 移除敌人
   */
  removeEnemy(enemyId) {
    const index = this.enemies.findIndex((e) => e.id === enemyId)
    if (index !== -1) {
      const enemy = this.enemies[index]
      enemy.dispose()
      this.enemies.splice(index, 1)
      this.physicsSystem.unregisterEnemy(enemyId)
    }
  }

  /**
   * 更新玩家位置（供外部调用）
   */
  updatePlayerPosition(position) {
    this.playerPosition.copy(position)
  }

  /**
   * 更新所有敌人
   */
  update(delta) {
    this.enemies.forEach((enemy) => {
      enemy.update(delta, this.playerPosition)
    })
  }

  /**
   * 清理所有敌人
   */
  dispose() {
    this.enemies.forEach((enemy) => enemy.dispose())
    this.enemies = []
  }
}

/**
 * 敌人类
 */
class Enemy extends EventEmitter {
  constructor(id, scene, physicsSystem, effectSystem, audioSystem) {
    super()
    this.id = id
    this.scene = scene
    this.physicsSystem = physicsSystem
    this.effectSystem = effectSystem
    this.audioSystem = audioSystem

    // 属性
    this.health = 100
    this.maxHealth = 100
    this.armor = 0
    this.speed = 2.0
    this.damage = 10
    this.attackRange = 15
    this.detectionRange = 30
    this.attackCooldown = 1.0
    this.lastAttackTime = 0

    // 状态
    this.state = 'patrol' // patrol, chase, attack, dead
    this.targetPosition = null
    this.patrolPoints = []
    this.currentPatrolIndex = 0

    // 创建3D模型
    this.createMesh()

    // 行为参数
    this.velocity = new THREE.Vector3()
  }

  createMesh() {
    const group = new THREE.Group()

    // 身体（使用BoxGeometry替代CapsuleGeometry以确保兼容性）
    const bodyGeometry = new THREE.BoxGeometry(0.6, 1.2, 0.6)
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 0.6
    body.castShadow = true
    group.add(body)

    // 头部
    const headGeometry = new THREE.SphereGeometry(0.2, 16, 16)
    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffaaaa })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 1.5
    head.castShadow = true
    group.add(head)

    // 标记为敌人
    body.userData.isEnemy = true
    body.userData.enemyId = this.id
    head.userData.isEnemy = true
    head.userData.enemyId = this.id

    this.mesh = group
    this.scene.add(group)
  }

  takeDamage(damage) {
    this.health -= damage
    this.health = Math.max(0, this.health)

    // 受伤特效
    this.effectSystem.createBloodSplat(this.mesh.position)

    if (this.health <= 0) {
      this.die()
      return true // 被击杀
    }

    return false
  }

  die() {
    this.state = 'dead'
    this.effectSystem.createDeathEffect(this.mesh.position)
    this.emit('killed', { enemyId: this.id })
  }

  update(delta, playerPosition) {
    if (this.state === 'dead') return

    const distanceToPlayer = this.mesh.position.distanceTo(playerPosition)

    // 状态机
    if (distanceToPlayer < this.attackRange && this.canAttack()) {
      this.state = 'attack'
      this.attack(playerPosition)
    } else if (distanceToPlayer < this.detectionRange) {
      this.state = 'chase'
      this.chase(playerPosition, delta)
    } else {
      this.state = 'patrol'
      this.patrol(delta)
    }

    // 面向玩家
    if (distanceToPlayer < this.detectionRange) {
      this.lookAt(playerPosition)
    }
  }

  canAttack() {
    const now = Date.now()
    return now - this.lastAttackTime >= this.attackCooldown * 1000
  }

  attack(playerPosition) {
    if (!this.canAttack()) return

    this.lastAttackTime = Date.now()

    // 发射子弹
    const direction = new THREE.Vector3()
      .subVectors(playerPosition, this.mesh.position)
      .normalize()

    this.physicsSystem.raycast(
      this.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0)),
      direction,
      this.attackRange,
      this.damage
    )

    // 特效和音效
    this.effectSystem.createMuzzleFlash(
      this.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0)),
      direction
    )
    this.audioSystem.playSound('enemyShoot')
  }

  chase(target, delta) {
    const direction = new THREE.Vector3()
      .subVectors(target, this.mesh.position)
      .normalize()

    this.velocity.copy(direction.multiplyScalar(this.speed))
    this.mesh.position.add(this.velocity.clone().multiplyScalar(delta))
  }

  patrol(delta) {
    // 简单的巡逻逻辑
    if (this.patrolPoints.length === 0) {
      // 如果没有巡逻点，随机移动
      const angle = Math.random() * Math.PI * 2
      const direction = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle))
      this.velocity.copy(direction.multiplyScalar(this.speed * 0.5))
      this.mesh.position.add(this.velocity.clone().multiplyScalar(delta))
    }
  }

  lookAt(target) {
    const direction = new THREE.Vector3()
      .subVectors(target, this.mesh.position)
      .normalize()

    const angle = Math.atan2(direction.x, direction.z)
    this.mesh.rotation.y = angle
  }

  dispose() {
    if (this.mesh) {
      this.scene.remove(this.mesh)
      this.mesh.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) object.material.dispose()
      })
    }
  }
}
