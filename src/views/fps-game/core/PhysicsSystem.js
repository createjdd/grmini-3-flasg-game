/**
 * 物理系统
 * 处理射线检测、命中判定、伤害计算
 */
import * as THREE from 'three'
import { EventEmitter } from './EventEmitter'

export class PhysicsSystem extends EventEmitter {
  constructor(scene) {
    super()
    this.scene = scene
    this.raycaster = new THREE.Raycaster()
    this.enemies = new Map() // enemyId -> enemy object
    this.playerPosition = new THREE.Vector3(0, 1.6, 0)
    this.playerHealth = 100
  }

  /**
   * 更新玩家位置和血量
   */
  updatePlayer(position, health = null) {
    this.playerPosition.copy(position)
    if (health !== null) {
      this.playerHealth = health
    }
  }

  /**
   * 射线检测
   * @param {THREE.Vector3} origin - 射线起点
   * @param {THREE.Vector3} direction - 射线方向
   * @param {number} range - 最大射程
   * @param {number} damage - 伤害值
   * @returns {Object} 返回命中信息 {hit: boolean, point: Vector3, distance: number}
   */
  raycast(origin, direction, range, damage) {
    let hitResult = {
      hit: false,
      point: null,
      distance: range,
      normal: null,
    }
    this.raycaster.set(origin, direction.normalize())

    // 获取场景中所有可碰撞的对象
    const objects = []
    this.scene.traverse((object) => {
      if (object.userData.collidable !== false && object.type === 'Mesh') {
        objects.push(object)
      }
    })

    const intersects = this.raycaster.intersectObjects(objects, true)

    // 检查是否击中玩家（简单球体检测）
    const playerHitDistance = this.checkPlayerHit(origin, direction, range)
    const firstHitDistance = intersects.length > 0 ? intersects[0].distance : Infinity
    
    if (playerHitDistance > 0 && playerHitDistance < firstHitDistance) {
      // 玩家被击中
      const finalDamage = damage // 简化处理，不计算部位伤害
      this.playerHealth = Math.max(0, this.playerHealth - finalDamage)
      const hitPoint = origin.clone().add(direction.clone().multiplyScalar(playerHitDistance))
      this.emit('playerHit', {
        health: this.playerHealth,
        damage: finalDamage,
        position: hitPoint,
      })
      hitResult.hit = true
      hitResult.point = hitPoint
      hitResult.distance = playerHitDistance
      return hitResult
    }

    if (intersects.length > 0) {
      const hit = intersects[0]
      const distance = hit.distance

      if (distance <= range) {
        hitResult.hit = true
        hitResult.point = hit.point.clone()
        hitResult.distance = distance
        hitResult.normal = hit.face.normal.clone()

        // 检查是否击中敌人
        if (hit.object.userData.isEnemy) {
          const enemyId = hit.object.userData.enemyId
          const enemy = this.enemies.get(enemyId)

          if (enemy) {
            // 计算部位伤害
            const bodyPart = this.getBodyPart(hit.point, enemy)
            const finalDamage = this.calculateDamage(damage, bodyPart, enemy)

            // 应用伤害
            const killed = enemy.takeDamage(finalDamage)

            this.emit('enemyHit', {
              enemyId,
              damage: finalDamage,
              killed,
              hitPoint: hit.point,
              bodyPart,
            })

            if (killed) {
              this.enemies.delete(enemyId)
            }
          }
        } else {
          // 击中环境物体，创建弹痕
          this.emit('environmentHit', {
            point: hit.point,
            normal: hit.face.normal,
            object: hit.object,
          })
        }
      } else {
        // 超出射程，计算最大射程点
        hitResult.point = origin.clone().add(direction.clone().multiplyScalar(range))
        hitResult.distance = range
      }
    } else {
      // 没有命中任何物体，计算最大射程点
      hitResult.point = origin.clone().add(direction.clone().multiplyScalar(range))
      hitResult.distance = range
    }

    return hitResult
  }

  /**
   * 获取击中部位
   */
  getBodyPart(hitPoint, enemy) {
    if (!enemy.mesh) return 'body'

    const enemyPos = enemy.mesh.position
    const relativeY = hitPoint.y - enemyPos.y

    // 简单的高度判断
    if (relativeY > 1.4) return 'head'
    if (relativeY > 0.8) return 'body'
    return 'legs'
  }

  /**
   * 计算伤害
   */
  calculateDamage(baseDamage, bodyPart, enemy) {
    let multiplier = 1.0

    // 部位伤害倍率
    switch (bodyPart) {
      case 'head':
        multiplier = 2.0 // 爆头双倍伤害
        break
      case 'body':
        multiplier = 1.0
        break
      case 'legs':
        multiplier = 0.7
        break
    }

    // 护甲减伤（如果有）
    if (enemy.armor > 0) {
      multiplier *= (1 - enemy.armor * 0.01)
    }

    return Math.max(1, Math.floor(baseDamage * multiplier))
  }

  /**
   * 注册敌人
   */
  registerEnemy(enemyId, enemy) {
    this.enemies.set(enemyId, enemy)
  }

  /**
   * 移除敌人
   */
  unregisterEnemy(enemyId) {
    this.enemies.delete(enemyId)
  }

  /**
   * 检查射线是否击中玩家（简单球体碰撞检测）
   */
  checkPlayerHit(origin, direction, range) {
    // 玩家碰撞体（简化为一个球体）
    const playerRadius = 0.5
    const playerHeight = 1.6

    // 计算射线到玩家中心的最短距离
    const toPlayer = new THREE.Vector3().subVectors(this.playerPosition, origin)
    const projectionLength = toPlayer.dot(direction)
    
    if (projectionLength < 0 || projectionLength > range) {
      return -1 // 射线方向相反或超出范围
    }

    const closestPoint = origin.clone().add(direction.clone().multiplyScalar(projectionLength))
    const distanceToPlayer = closestPoint.distanceTo(this.playerPosition)

    // 检查是否在玩家碰撞体内
    if (distanceToPlayer <= playerRadius) {
      return projectionLength
    }

    return -1
  }

  /**
   * 检查玩家是否被击中（旧方法，保留兼容性）
   */
  checkPlayerHitLegacy(playerPosition, enemyPosition, enemyDirection, range) {
    const distance = playerPosition.distanceTo(enemyPosition)
    if (distance > range) return false

    const direction = new THREE.Vector3()
      .subVectors(playerPosition, enemyPosition)
      .normalize()

    const dot = direction.dot(enemyDirection)
    return dot > 0.9 // 角度容差
  }
}
