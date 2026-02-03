/**
 * 特效系统
 * 处理粒子特效、贴花、后处理等视觉效果
 */
import * as THREE from 'three'

export class EffectSystem {
  constructor(scene, camera) {
    this.scene = scene
    this.camera = camera
    this.particles = []
    this.decals = [] // 弹痕贴花
  }

  /**
   * 创建枪口火焰
   */
  createMuzzleFlash(position, direction) {
    const flashGroup = new THREE.Group()

    // 主火焰
    const flashGeometry = new THREE.SphereGeometry(0.1, 8, 8)
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.9,
    })
    const flash = new THREE.Mesh(flashGeometry, flashMaterial)
    flashGroup.add(flash)

    // 火花粒子
    for (let i = 0; i < 10; i++) {
      const sparkGeometry = new THREE.SphereGeometry(0.02, 4, 4)
      const sparkMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
        transparent: true,
        opacity: 0.8,
      })
      const spark = new THREE.Mesh(sparkGeometry, sparkMaterial)
      spark.position.set(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
      )
      flashGroup.add(spark)
    }

    flashGroup.position.copy(position)
    flashGroup.lookAt(position.clone().add(direction))
    this.scene.add(flashGroup)

    // 动画
    const animate = () => {
      flashGroup.scale.multiplyScalar(1.2)
      flashMaterial.opacity -= 0.1

      if (flashMaterial.opacity <= 0) {
        this.scene.remove(flashGroup)
        flashGroup.traverse((object) => {
          if (object.geometry) object.geometry.dispose()
          if (object.material) object.material.dispose()
        })
        return
      }

      requestAnimationFrame(animate)
    }
    animate()
  }

  /**
   * 创建弹痕
   */
  createBulletHole(position, normal, object) {
    // 创建弹痕贴花
    const decalSize = 0.1
    const decalGeometry = new THREE.PlaneGeometry(decalSize, decalSize)
    const decalMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    })

    const decal = new THREE.Mesh(decalGeometry, decalMaterial)

    // 定位贴花
    decal.position.copy(position)
    decal.lookAt(position.clone().add(normal))
    decal.rotateZ(Math.random() * Math.PI * 2)

    this.scene.add(decal)
    this.decals.push(decal)

    // 限制弹痕数量
    if (this.decals.length > 50) {
      const oldDecal = this.decals.shift()
      this.scene.remove(oldDecal)
      oldDecal.geometry.dispose()
      oldDecal.material.dispose()
    }
  }

  /**
   * 创建命中特效（火花/冲击）
   */
  createHitEffect(position, normal) {
    const hitGroup = new THREE.Group()
    hitGroup.position.copy(position) // 设置组的位置为命中点

    // 火花粒子
    const sparkCount = 8
    for (let i = 0; i < sparkCount; i++) {
      const sparkGeometry = new THREE.SphereGeometry(0.02, 4, 4)
      const sparkMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.1 + Math.random() * 0.1, 1, 0.5 + Math.random() * 0.5),
        transparent: true,
        opacity: 1,
      })
      const spark = new THREE.Mesh(sparkGeometry, sparkMaterial)
      
      // 火花从命中点向外飞散（相对于命中点的方向）
      const angle = (Math.PI * 2 * i) / sparkCount
      const speed = 0.5 + Math.random() * 0.5
      
      // 计算火花方向（垂直于法线的平面内）
      const tangent = new THREE.Vector3()
      if (Math.abs(normal.y) < 0.9) {
        tangent.crossVectors(normal, new THREE.Vector3(0, 1, 0)).normalize()
      } else {
        tangent.crossVectors(normal, new THREE.Vector3(1, 0, 0)).normalize()
      }
      const bitangent = new THREE.Vector3().crossVectors(normal, tangent).normalize()
      
      const sparkDir = new THREE.Vector3()
        .addScaledVector(tangent, Math.cos(angle))
        .addScaledVector(bitangent, Math.sin(angle))
        .addScaledVector(normal, Math.random() * 0.3 - 0.15)
        .normalize()
      
      spark.userData.velocity = sparkDir.multiplyScalar(speed)
      
      // 火花初始位置在命中点（相对于组的位置为0）
      spark.position.set(0, 0, 0)
      hitGroup.add(spark)
    }

    // 冲击波圆圈
    const impactGeometry = new THREE.RingGeometry(0, 0.1, 16)
    const impactMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
    })
    const impact = new THREE.Mesh(impactGeometry, impactMaterial)
    impact.position.set(0, 0, 0) // 相对于组的位置
    impact.lookAt(normal) // 面向法线方向
    hitGroup.add(impact)

    this.scene.add(hitGroup)

    // 动画
    let frame = 0
    const deltaTime = 0.016 // 约60fps
    const animate = () => {
      frame++
      
      // 更新火花位置（相对于组的位置）
      hitGroup.children.forEach((spark) => {
        if (spark.userData && spark.userData.velocity) {
          const velocity = spark.userData.velocity
          spark.position.add(velocity.clone().multiplyScalar(deltaTime))
          spark.userData.velocity.multiplyScalar(0.95) // 摩擦力
          if (spark.material) {
            spark.material.opacity -= 0.05
          }
        }
      })

      // 冲击波扩散
      if (impact && impactMaterial) {
        impact.scale.multiplyScalar(1.1)
        impactMaterial.opacity -= 0.1
      }

      if (frame > 30 || (impactMaterial && impactMaterial.opacity <= 0)) {
        this.scene.remove(hitGroup)
        hitGroup.traverse((object) => {
          if (object.geometry) object.geometry.dispose()
          if (object.material) object.material.dispose()
        })
        return
      }

      requestAnimationFrame(animate)
    }
    animate()
  }

  /**
   * 创建敌人命中特效（火花+血迹）
   */
  createEnemyHitEffect(position, normal) {
    // 创建命中火花
    this.createHitEffect(position, normal)
    
    // 创建小血迹
    const splatGeometry = new THREE.CircleGeometry(0.05, 8)
    const splatMaterial = new THREE.MeshBasicMaterial({
      color: 0x8b0000,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    })
    const splat = new THREE.Mesh(splatGeometry, splatMaterial)
    splat.position.copy(position)
    splat.lookAt(position.clone().add(normal))
    
    this.scene.add(splat)

    // 淡出
    setTimeout(() => {
      const fadeOut = () => {
        splatMaterial.opacity -= 0.05
        if (splatMaterial.opacity <= 0) {
          this.scene.remove(splat)
          splat.geometry.dispose()
          splat.material.dispose()
          return
        }
        requestAnimationFrame(fadeOut)
      }
      fadeOut()
    }, 100)
  }

  /**
   * 创建血迹
   */
  createBloodSplat(position) {
    const splatGroup = new THREE.Group()

    // 主血迹
    const splatGeometry = new THREE.CircleGeometry(0.2, 16)
    const splatMaterial = new THREE.MeshBasicMaterial({
      color: 0x8b0000,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    })
    const splat = new THREE.Mesh(splatGeometry, splatMaterial)
    splat.rotation.x = Math.PI / 2
    splat.position.copy(position)
    splat.position.y = 0.01 // 稍微高于地面
    splatGroup.add(splat)

    // 小血滴
    for (let i = 0; i < 5; i++) {
      const dropGeometry = new THREE.CircleGeometry(0.05, 8)
      const dropMaterial = new THREE.MeshBasicMaterial({
        color: 0x8b0000,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      })
      const drop = new THREE.Mesh(dropGeometry, dropMaterial)
      drop.rotation.x = Math.PI / 2
      drop.position.set(
        position.x + (Math.random() - 0.5) * 0.5,
        0.01,
        position.z + (Math.random() - 0.5) * 0.5
      )
      splatGroup.add(drop)
    }

    this.scene.add(splatGroup)
  }

  /**
   * 创建死亡特效
   */
  createDeathEffect(position) {
    // 爆炸粒子
    const particleCount = 20
    const particles = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const velocities = []

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      positions[i3] = position.x
      positions[i3 + 1] = position.y
      positions[i3 + 2] = position.z

      const color = new THREE.Color().setHSL(0, 1, 0.5)
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      velocities.push({
        x: (Math.random() - 0.5) * 5,
        y: Math.random() * 5,
        z: (Math.random() - 0.5) * 5,
      })
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 1,
    })

    const particleSystem = new THREE.Points(particles, particleMaterial)
    this.scene.add(particleSystem)

    // 动画
    let frame = 0
    const animate = () => {
      frame++
      const positions = particleSystem.geometry.attributes.position.array

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3
        positions[i3] += velocities[i].x * 0.016
        positions[i3 + 1] += velocities[i].y * 0.016
        positions[i3 + 2] += velocities[i].z * 0.016

        velocities[i].y -= 9.8 * 0.016 // 重力
      }

      particleSystem.geometry.attributes.position.needsUpdate = true
      particleMaterial.opacity -= 0.02

      if (particleMaterial.opacity <= 0 || frame > 60) {
        this.scene.remove(particleSystem)
        particleSystem.geometry.dispose()
        particleSystem.material.dispose()
        return
      }

      requestAnimationFrame(animate)
    }
    animate()
  }

  /**
   * 创建爆炸特效
   */
  createExplosion(position, size = 1) {
    const explosionGroup = new THREE.Group()

    // 火球
    const fireGeometry = new THREE.SphereGeometry(size, 16, 16)
    const fireMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.9,
    })
    const fire = new THREE.Mesh(fireGeometry, fireMaterial)
    explosionGroup.add(fire)

    // 烟雾
    const smokeGeometry = new THREE.SphereGeometry(size * 1.5, 16, 16)
    const smokeMaterial = new THREE.MeshBasicMaterial({
      color: 0x333333,
      transparent: true,
      opacity: 0.5,
    })
    const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial)
    explosionGroup.add(smoke)

    explosionGroup.position.copy(position)
    this.scene.add(explosionGroup)

    // 动画
    let frame = 0
    const animate = () => {
      frame++
      fire.scale.multiplyScalar(1.1)
      smoke.scale.multiplyScalar(1.05)
      fireMaterial.opacity -= 0.05
      smokeMaterial.opacity -= 0.02

      if (fireMaterial.opacity <= 0 || frame > 30) {
        this.scene.remove(explosionGroup)
        explosionGroup.traverse((object) => {
          if (object.geometry) object.geometry.dispose()
          if (object.material) object.material.dispose()
        })
        return
      }

      requestAnimationFrame(animate)
    }
    animate()
  }

  /**
   * 创建弹道轨迹（增强版）
   */
  createBulletTrail(start, end) {
    const distance = start.distanceTo(end)
    
    // 创建简单的两点轨迹线
    const points = [start.clone(), end.clone()]

    // 主轨迹线（亮黄色/橙色，更明显）
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: 0xffaa00,
      transparent: true,
      opacity: 1.0,
      linewidth: 3,
    })
    const line = new THREE.Line(geometry, material)
    this.scene.add(line)

    // 添加发光效果（外圈，更宽）
    const glowGeometry = new THREE.BufferGeometry().setFromPoints(points)
    const glowMaterial = new THREE.LineBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.5,
      linewidth: 5,
    })
    const glowLine = new THREE.Line(glowGeometry, glowMaterial)
    this.scene.add(glowLine)

    // 在起点和终点添加光点
    const startGlow = this.createGlowPoint(start, 0xffff00)
    const endGlow = this.createGlowPoint(end, 0xff6600)
    this.scene.add(startGlow)
    this.scene.add(endGlow)

    // 淡出动画
    let frame = 0
    const animate = () => {
      frame++
      const fadeSpeed = 0.12
      
      material.opacity -= fadeSpeed
      glowMaterial.opacity -= fadeSpeed * 0.6
      
      // 光点淡出
      if (startGlow.material) {
        startGlow.material.opacity -= fadeSpeed * 1.5
        startGlow.scale.multiplyScalar(0.95)
      }
      if (endGlow.material) {
        endGlow.material.opacity -= fadeSpeed * 1.5
        endGlow.scale.multiplyScalar(0.95)
      }

      if (material.opacity <= 0) {
        this.scene.remove(line)
        this.scene.remove(glowLine)
        this.scene.remove(startGlow)
        this.scene.remove(endGlow)
        geometry.dispose()
        glowGeometry.dispose()
        material.dispose()
        glowMaterial.dispose()
        startGlow.geometry.dispose()
        startGlow.material.dispose()
        endGlow.geometry.dispose()
        endGlow.material.dispose()
        return
      }

      requestAnimationFrame(animate)
    }
    
    // 延迟开始淡出，让轨迹可见
    setTimeout(() => {
      animate()
    }, 30)
  }

  /**
   * 创建光点
   */
  createGlowPoint(position, color) {
    const geometry = new THREE.SphereGeometry(0.05, 8, 8)
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1.0,
    })
    const glow = new THREE.Mesh(geometry, material)
    glow.position.copy(position)
    return glow
  }

  /**
   * 创建子弹飞行粒子效果
   */
  createBulletParticles(start, end, direction) {
    const distance = start.distanceTo(end)
    const particleCount = Math.min(20, Math.floor(distance / 5)) // 根据距离调整粒子数量
    
    if (particleCount < 2) return

    const particleGroup = new THREE.Group()

    // 沿轨迹创建粒子
    for (let i = 0; i < particleCount; i++) {
      const t = i / (particleCount - 1)
      const position = new THREE.Vector3().lerpVectors(start, end, t)
      
      // 创建小光点
      const particleGeometry = new THREE.SphereGeometry(0.01, 4, 4)
      const particleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        transparent: true,
        opacity: 0.8,
      })
      const particle = new THREE.Mesh(particleGeometry, particleMaterial)
      particle.position.copy(position)
      
      // 添加随机偏移
      particle.position.x += (Math.random() - 0.5) * 0.05
      particle.position.y += (Math.random() - 0.5) * 0.05
      particle.position.z += (Math.random() - 0.5) * 0.05
      
      particleGroup.add(particle)
    }

    this.scene.add(particleGroup)

    // 快速淡出
    let frame = 0
    const animate = () => {
      frame++
      
      particleGroup.children.forEach((particle) => {
        if (particle.material) {
          particle.material.opacity -= 0.2
          particle.scale.multiplyScalar(0.95)
        }
      })

      if (frame > 10 || (particleGroup.children[0] && particleGroup.children[0].material.opacity <= 0)) {
        this.scene.remove(particleGroup)
        particleGroup.traverse((object) => {
          if (object.geometry) object.geometry.dispose()
          if (object.material) object.material.dispose()
        })
        return
      }

      requestAnimationFrame(animate)
    }
    animate()
  }

  /**
   * 更新特效
   */
  update(delta) {
    // 更新粒子系统等
  }
}
