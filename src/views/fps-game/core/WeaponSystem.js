/**
 * 武器系统
 * 处理武器切换、射击、装弹、后坐力等
 */
import * as THREE from 'three'
import { EventEmitter } from './EventEmitter'

export class WeaponSystem extends EventEmitter {
  constructor(camera, effectSystem, audioSystem, physicsSystem, fpsController = null) {
    super()
    this.camera = camera
    this.effectSystem = effectSystem
    this.audioSystem = audioSystem
    this.physicsSystem = physicsSystem
    this.fpsController = fpsController // 用于应用后坐力

    // 武器配置
    this.weapons = {
      rifle: {
        name: 'Assault Rifle',
        damage: 25,
        fireRate: 600, // 每分钟射速
        range: 500,
        spread: 0.02,
        recoil: 0.1,
        ammoPerMag: 30,
        reserveAmmo: 90,
        reloadTime: 2.0,
        model: null,
      },
      pistol: {
        name: 'Pistol',
        damage: 15,
        fireRate: 300,
        range: 200,
        spread: 0.05,
        recoil: 0.15,
        ammoPerMag: 15,
        reserveAmmo: 45,
        reloadTime: 1.5,
        model: null,
      },
      shotgun: {
        name: 'Shotgun',
        damage: 40,
        fireRate: 60,
        range: 50,
        spread: 0.15,
        recoil: 0.3,
        ammoPerMag: 8,
        reserveAmmo: 24,
        reloadTime: 2.5,
        pellets: 8, // 霰弹数量
        model: null,
      },
    }

    this.currentWeapon = 'rifle'
    this.weaponData = { ...this.weapons[this.currentWeapon] }
    this.currentAmmo = this.weaponData.ammoPerMag
    this.reserveAmmo = this.weaponData.reserveAmmo

    // 射击状态
    this.isShooting = false
    this.isReloading = false
    this.lastShotTime = 0
    this.reloadStartTime = 0

    // 后坐力
    this.recoilOffset = new THREE.Vector2(0, 0)
    this.targetRecoil = new THREE.Vector2(0, 0)
    this.maxRecoil = 0.5 // 最大后坐力限制（弧度）

    // 武器模型
    this.weaponMesh = null
    this.initWeaponModel()

    // 绑定事件
    this.onMouseDown = this.onMouseDown.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)

    document.addEventListener('mousedown', this.onMouseDown)
    document.addEventListener('mouseup', this.onMouseUp)
    document.addEventListener('keydown', this.onKeyDown)
  }

  initWeaponModel() {
    // 创建简单的武器3D模型
    const weaponGroup = new THREE.Group()

    // 枪身
    const bodyGeometry = new THREE.BoxGeometry(0.3, 0.1, 1.2)
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    weaponGroup.add(body)

    // 枪管
    const barrelGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 16)
    const barrelMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 })
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial)
    barrel.rotation.x = Math.PI / 2
    barrel.position.set(0, 0, 0.4)
    weaponGroup.add(barrel)

    // 弹匣
    const magGeometry = new THREE.BoxGeometry(0.15, 0.2, 0.3)
    const magMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 })
    const mag = new THREE.Mesh(magGeometry, magMaterial)
    mag.position.set(0, -0.15, -0.2)
    weaponGroup.add(mag)

    // 设置武器位置（第一人称视角）
    weaponGroup.position.set(0.3, -0.3, -0.5)
    weaponGroup.rotation.y = Math.PI

    this.weaponMesh = weaponGroup
    this.camera.add(weaponGroup)
  }

  onMouseDown(event) {
    if (event.button === 0) {
      // 左键射击
      this.isShooting = true
      this.shoot()
    }
  }

  onMouseUp(event) {
    if (event.button === 0) {
      this.isShooting = false
    }
  }

  onKeyDown(event) {
    if (event.code === 'KeyR') {
      this.reload()
    } else if (event.code === 'Digit1') {
      this.switchWeapon('rifle')
    } else if (event.code === 'Digit2') {
      this.switchWeapon('pistol')
    } else if (event.code === 'Digit3') {
      this.switchWeapon('shotgun')
    }
  }

  switchWeapon(weaponName) {
    if (this.isReloading || weaponName === this.currentWeapon) return

    this.currentWeapon = weaponName
    this.weaponData = { ...this.weapons[weaponName] }
    this.currentAmmo = this.weaponData.ammoPerMag
    this.reserveAmmo = this.weaponData.reserveAmmo

    // 移除旧武器模型
    if (this.weaponMesh) {
      this.camera.remove(this.weaponMesh)
    }

    // 创建新武器模型
    this.initWeaponModel()

    this.emit('weaponChanged', { name: this.weaponData.name })
    this.emit('ammoChanged', {
      current: this.currentAmmo,
      reserve: this.reserveAmmo,
    })
  }

  shoot() {
    if (this.isReloading) return

    const now = Date.now()
    const timeSinceLastShot = now - this.lastShotTime
    const minTimeBetweenShots = (60 / this.weaponData.fireRate) * 1000

    if (timeSinceLastShot < minTimeBetweenShots) return

    if (this.currentAmmo <= 0) {
      this.reload()
      return
    }

    this.currentAmmo--
    this.lastShotTime = now

    // 获取射击方向和起点
    const direction = this.getShootDirection()
    const origin = this.camera.position.clone()
    // 枪口位置（稍微向前偏移）
    const muzzleOffset = direction.clone().multiplyScalar(-0.3)
    const muzzlePosition = origin.clone().add(muzzleOffset)

    // 发射子弹
    this.fireBullet()

    // 后坐力
    this.applyRecoil()

    // 特效（在枪口位置创建）
    this.effectSystem.createMuzzleFlash(muzzlePosition, direction)
    this.audioSystem.playSound('shoot')

    // 更新UI
    this.emit('shotFired')
    this.emit('ammoChanged', {
      current: this.currentAmmo,
      reserve: this.reserveAmmo,
    })

    // 武器动画
    this.animateWeapon()
  }

  fireBullet() {
    const direction = this.getShootDirection()
    // 获取枪口位置（稍微向前偏移）
    const muzzleOffset = direction.clone().multiplyScalar(-0.3)
    const origin = this.camera.position.clone().add(muzzleOffset)

    // 添加散布
    const spread = this.weaponData.spread
    direction.x += (Math.random() - 0.5) * spread
    direction.y += (Math.random() - 0.5) * spread
    direction.z += (Math.random() - 0.5) * spread
    direction.normalize()

    // 霰弹枪特殊处理
    if (this.currentWeapon === 'shotgun' && this.weaponData.pellets) {
      for (let i = 0; i < this.weaponData.pellets; i++) {
        const pelletDir = direction.clone()
        pelletDir.x += (Math.random() - 0.5) * spread * 2
        pelletDir.y += (Math.random() - 0.5) * spread * 2
        pelletDir.z += (Math.random() - 0.5) * spread * 2
        pelletDir.normalize()

        const hitResult = this.physicsSystem.raycast(origin, pelletDir, this.weaponData.range, this.weaponData.damage)
        
        // 创建弹道轨迹
        if (hitResult && hitResult.point) {
          this.effectSystem.createBulletTrail(origin, hitResult.point)
          // 创建子弹飞行粒子效果
          this.effectSystem.createBulletParticles(origin, hitResult.point, pelletDir)
        }
      }
    } else {
      const hitResult = this.physicsSystem.raycast(origin, direction, this.weaponData.range, this.weaponData.damage)
      
      // 创建弹道轨迹
      if (hitResult && hitResult.point) {
        this.effectSystem.createBulletTrail(origin, hitResult.point)
        // 创建子弹飞行粒子效果
        this.effectSystem.createBulletParticles(origin, hitResult.point, direction)
      }
    }
  }

  getShootDirection() {
    const direction = new THREE.Vector3(0, 0, -1)
    direction.applyQuaternion(this.camera.quaternion)
    return direction
  }

  applyRecoil() {
    const recoilAmount = this.weaponData.recoil
    // 添加后坐力，但限制最大值
    this.targetRecoil.x += (Math.random() - 0.5) * recoilAmount * 2
    this.targetRecoil.y += recoilAmount * (0.5 + Math.random() * 0.5)
    
    // 限制后坐力最大值，防止无限累积
    this.targetRecoil.x = Math.max(-this.maxRecoil, Math.min(this.maxRecoil, this.targetRecoil.x))
    this.targetRecoil.y = Math.max(0, Math.min(this.maxRecoil, this.targetRecoil.y))
  }

  animateWeapon() {
    if (!this.weaponMesh) return

    // 射击时的后坐力动画
    const kickback = 0.05
    this.weaponMesh.position.z += kickback
    this.weaponMesh.rotation.x -= 0.1

    setTimeout(() => {
      if (this.weaponMesh) {
        this.weaponMesh.position.z -= kickback
        this.weaponMesh.rotation.x += 0.1
      }
    }, 100)
  }

  reload() {
    if (this.isReloading || this.currentAmmo === this.weaponData.ammoPerMag) return
    if (this.reserveAmmo === 0) return

    this.isReloading = true
    this.reloadStartTime = Date.now()

    this.audioSystem.playSound('reload')

    setTimeout(() => {
      const ammoNeeded = this.weaponData.ammoPerMag - this.currentAmmo
      const ammoToReload = Math.min(ammoNeeded, this.reserveAmmo)

      this.currentAmmo += ammoToReload
      this.reserveAmmo -= ammoToReload

      this.isReloading = false

      this.emit('ammoChanged', {
        current: this.currentAmmo,
        reserve: this.reserveAmmo,
      })
    }, this.weaponData.reloadTime * 1000)
  }

  update(delta) {
    // 自动射击
    if (this.isShooting && !this.isReloading) {
      this.shoot()
    }

    // 后坐力恢复（加快恢复速度）
    this.recoilOffset.lerp(this.targetRecoil, delta * 15)
    // 加快targetRecoil的恢复速度，确保能快速回到0
    this.targetRecoil.lerp(new THREE.Vector2(0, 0), delta * 8)

    // 应用后坐力到相机（通过FPSController的pitchObject）
    if (this.recoilOffset.length() > 0.001) {
      if (this.fpsController && this.fpsController.pitchObject) {
        // 使用FPSController的pitchObject来应用后坐力
        // 后坐力是临时偏移，会通过lerp自动恢复
        const recoilPitch = this.recoilOffset.y * delta * 8 // 调整系数
        const recoilYaw = this.recoilOffset.x * delta * 8
        
        // 应用后坐力到pitchObject（上下视角）
        this.fpsController.pitchObject.rotation.x += recoilPitch
        
        // 应用后坐力到yawObject（左右视角）
        if (this.fpsController.yawObject) {
          this.fpsController.yawObject.rotation.y += recoilYaw
        }
        
        // 限制pitch范围（防止后坐力导致视角超出限制）
        this.fpsController.pitchObject.rotation.x = Math.max(
          -this.fpsController.pitchRange,
          Math.min(this.fpsController.pitchRange, this.fpsController.pitchObject.rotation.x)
        )
      } else {
        // 如果没有FPSController，直接修改相机（向后兼容）
        this.camera.rotation.x += this.recoilOffset.y * delta
        this.camera.rotation.y += this.recoilOffset.x * delta
      }
    } else {
      // 当后坐力接近0时，重置偏移量，确保完全恢复
      this.recoilOffset.set(0, 0)
      this.targetRecoil.set(0, 0)
    }
  }

  dispose() {
    document.removeEventListener('mousedown', this.onMouseDown)
    document.removeEventListener('mouseup', this.onMouseUp)
    document.removeEventListener('keydown', this.onKeyDown)

    if (this.weaponMesh) {
      this.camera.remove(this.weaponMesh)
    }
  }
}
