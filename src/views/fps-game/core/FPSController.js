/**
 * 第一人称控制器
 * 处理玩家移动、视角控制和鼠标锁定
 */
import * as THREE from 'three'

export class FPSController {
  constructor(camera, scene) {
    this.camera = camera
    this.scene = scene
    this.enabled = false

    // 移动参数
    this.velocity = new THREE.Vector3()
    this.direction = new THREE.Vector3()
    this.moveSpeed = 5.0
    this.sprintMultiplier = 1.5
    this.isSprinting = false

    // 视角参数
    this.euler = new THREE.Euler(0, 0, 0, 'YXZ')
    this.pitchObject = new THREE.Object3D()
    this.yawObject = new THREE.Object3D()
    this.yawObject.add(this.pitchObject)
    this.pitchObject.add(camera)

    // 鼠标控制
    this.mouseMovement = { x: 0, y: 0 }
    this.sensitivity = 0.002
    this.pitchRange = Math.PI / 3 // 60度上下视角限制

    // 键盘状态
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      jump: false,
    }

    // 物理参数
    this.canJump = false
    this.gravity = -30
    this.jumpVelocity = 8

    // 绑定事件
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onKeyUp = this.onKeyUp.bind(this)
    this.onPointerLockChange = this.onPointerLockChange.bind(this)
    this.onPointerLockError = this.onPointerLockError.bind(this)

    // 初始化
    this.init()
  }

  init() {
    // 设置初始位置
    this.yawObject.position.set(0, 1.6, 0)
    this.scene.add(this.yawObject)

    // 添加事件监听
    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('keydown', this.onKeyDown)
    document.addEventListener('keyup', this.onKeyUp)
    document.addEventListener('pointerlockchange', this.onPointerLockChange)
    document.addEventListener('pointerlockerror', this.onPointerLockError)
  }

  enable() {
    this.enabled = true
    document.body.requestPointerLock()
  }

  disable() {
    this.enabled = false
    if (document.pointerLockElement) {
      document.exitPointerLock()
    }
  }

  onPointerLockChange() {
    if (document.pointerLockElement === document.body) {
      this.enabled = true
    } else {
      this.enabled = false
    }
  }

  onPointerLockError() {
    console.error('Pointer lock failed')
  }

  onMouseMove(event) {
    if (!this.enabled) return

    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0

    this.yawObject.rotation.y -= movementX * this.sensitivity
    this.pitchObject.rotation.x -= movementY * this.sensitivity

    // 限制上下视角
    this.pitchObject.rotation.x = Math.max(
      -this.pitchRange,
      Math.min(this.pitchRange, this.pitchObject.rotation.x)
    )
  }

  onKeyDown(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true
        break
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true
        break
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true
        break
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true
        break
      case 'ShiftLeft':
        this.keys.sprint = true
        break
      case 'Space':
        if (this.canJump) {
          this.velocity.y = this.jumpVelocity
          this.canJump = false
        }
        break
    }
  }

  onKeyUp(event) {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false
        break
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false
        break
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false
        break
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false
        break
      case 'ShiftLeft':
        this.keys.sprint = false
        break
    }
  }

  update(delta) {
    if (!this.enabled) return

    // 计算移动方向
    this.direction.set(0, 0, 0)

    if (this.keys.forward) this.direction.z -= 1
    if (this.keys.backward) this.direction.z += 1
    if (this.keys.left) this.direction.x -= 1
    if (this.keys.right) this.direction.x += 1

    // 归一化方向向量
    if (this.direction.length() > 0) {
      this.direction.normalize()
    }

    // 应用相机旋转到移动方向
    const speed = this.keys.sprint ? this.moveSpeed * this.sprintMultiplier : this.moveSpeed
    const forward = new THREE.Vector3(0, 0, -1)
    const right = new THREE.Vector3(1, 0, 0)

    forward.applyQuaternion(this.yawObject.quaternion)
    right.applyQuaternion(this.yawObject.quaternion)

    forward.multiplyScalar(this.direction.z * speed * delta)
    right.multiplyScalar(this.direction.x * speed * delta)

    this.velocity.x = forward.x + right.x
    this.velocity.z = forward.z + right.z

    // 应用重力
    this.velocity.y += this.gravity * delta

    // 更新位置
    this.yawObject.position.x += this.velocity.x
    this.yawObject.position.y += this.velocity.y * delta
    this.yawObject.position.z += this.velocity.z

    // 地面碰撞检测（简单版本）
    if (this.yawObject.position.y < 1.6) {
      this.yawObject.position.y = 1.6
      this.velocity.y = 0
      this.canJump = true
    }

    // 应用摩擦力
    this.velocity.x *= 0.9
    this.velocity.z *= 0.9
  }

  getPosition() {
    return this.yawObject.position.clone()
  }

  getDirection() {
    const direction = new THREE.Vector3(0, 0, -1)
    direction.applyQuaternion(this.pitchObject.quaternion)
    return direction
  }

  getCamera() {
    return this.camera
  }

  dispose() {
    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('keydown', this.onKeyDown)
    document.removeEventListener('keyup', this.onKeyUp)
    document.removeEventListener('pointerlockchange', this.onPointerLockChange)
    document.removeEventListener('pointerlockerror', this.onPointerLockError)
  }
}
