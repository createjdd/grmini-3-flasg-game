<template>
  <div class="rupiah-cepat-page">
    <!-- Status Bar -->
    <div class="status-bar">
      <div class="status-left">
        <span class="time">9:41</span>
      </div>
      <div class="status-right">
        <div class="signal-icon">📶</div>
        <div class="wifi-icon">📶</div>
        <div class="battery-icon">🔋</div>
      </div>
    </div>

    <!-- Header with Logo and Support -->
    <div class="header-section">
      <div class="support-icon">🎧</div>
      <div class="brand-section">
        <div class="logo">
          <div class="logo-shape">
            <div class="logo-blue-part"></div>
            <div class="logo-yellow-part"></div>
          </div>
        </div>
        <div class="brand-name">RupiahCepat</div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Greeting -->
      <div class="greeting-text">
        Hai Sobat! Daftar/Masuk ke Akun
      </div>

      <!-- Phone Input -->
      <div class="phone-input-container">
        <div class="country-code">+62</div>
        <input
          v-model="phoneNumber"
          type="tel"
          class="phone-input"
          placeholder="Masukkan nomor HP"
          maxlength="13"
        />
      </div>

      <!-- Register Button -->
      <button class="register-button" @click="handleRegister">
        Daftar/Masuk Dapat Rp50.000
      </button>

      <!-- Terms and Conditions -->
      <div class="terms-text">
        Sebelum lanjut, pastikan telah membaca, mengetahui, dan menyetujui ketentuan-ketentuan dalam
        <a href="#" class="link">Informasi Umum</a>,
        <a href="#" class="link">Syarat dan Ketentuan</a>, dan
        <a href="#" class="link">Kebijakan Privasi</a>
        RupiahCepat
      </div>
    </div>

    <!-- Numeric Keypad -->
    <div class="keypad-section">
      <div class="keypad">
        <button
          v-for="key in keypadKeys"
          :key="key.value"
          class="keypad-key"
          :class="{ 'key-empty': key.value === '', 'key-delete': key.value === 'delete' }"
          @click="handleKeypadClick(key)"
        >
          <span v-if="key.value !== 'delete' && key.value !== ''" class="key-number">{{ key.number }}</span>
          <span v-if="key.value !== 'delete' && key.value !== '' && key.letters" class="key-letters">{{ key.letters }}</span>
          <span v-if="key.value === 'delete'" class="delete-icon">✕</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const phoneNumber = ref('8152 4569 908')

const keypadKeys = [
  { value: '1', number: '1', letters: '' },
  { value: '2', number: '2', letters: 'ABC' },
  { value: '3', number: '3', letters: 'DEF' },
  { value: '4', number: '4', letters: 'GHI' },
  { value: '5', number: '5', letters: 'JKL' },
  { value: '6', number: '6', letters: 'MNO' },
  { value: '7', number: '7', letters: 'PQRS' },
  { value: '8', number: '8', letters: 'TUV' },
  { value: '9', number: '9', letters: 'WXYZ' },
  { value: '', number: '', letters: '' },
  { value: '0', number: '0', letters: '' },
  { value: 'delete', number: '', letters: '' },
]

const handleKeypadClick = (key) => {
  if (key.value === 'delete') {
    phoneNumber.value = phoneNumber.value.slice(0, -1)
  } else if (key.value !== '') {
    // 格式化手机号（每4位加空格）
    const current = phoneNumber.value.replace(/\s/g, '')
    if (current.length < 13) {
      const newValue = current + key.value
      // 格式化：每4位加一个空格
      phoneNumber.value = newValue.replace(/(\d{4})(?=\d)/g, '$1 ')
    }
  }
}

const handleRegister = () => {
  console.log('Register with phone:', phoneNumber.value)
  // 这里可以添加注册逻辑
}
</script>

<style scoped>
.rupiah-cepat-page {
  width: 100vw;
  height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  overflow: hidden;
}

/* Status Bar */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px 4px;
  height: 44px;
  background: #ffffff;
}

.status-left {
  font-size: 15px;
  font-weight: 600;
  color: #000000;
}

.status-right {
  display: flex;
  gap: 4px;
  align-items: center;
}

.status-right > div {
  width: 17px;
  height: 10px;
  font-size: 12px;
}

/* Header Section */
.header-section {
  position: relative;
  padding: 20px 16px;
  background: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.support-icon {
  position: absolute;
  right: 16px;
  top: 20px;
  font-size: 24px;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 40px;
  height: 40px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-shape {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
}

.logo-blue-part {
  position: absolute;
  width: 70%;
  height: 50%;
  background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
  border-radius: 6px 6px 0 0;
  top: 0;
  left: 0;
  transform: rotate(-12deg) skewX(-5deg);
  box-shadow: 0 2px 4px rgba(0, 122, 255, 0.3);
}

.logo-yellow-part {
  position: absolute;
  width: 70%;
  height: 50%;
  background: linear-gradient(135deg, #FFD700 0%, #FFC700 100%);
  border-radius: 0 0 6px 6px;
  bottom: 0;
  right: 0;
  transform: rotate(12deg) skewX(5deg);
  box-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
}

.brand-name {
  font-size: 24px;
  font-weight: 700;
  color: #007AFF;
  letter-spacing: -0.5px;
}

/* Main Content */
.main-content {
  flex: 1;
  padding: 32px 20px;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

.greeting-text {
  font-size: 18px;
  font-weight: 600;
  color: #000000;
  text-align: center;
  margin-bottom: 8px;
}

/* Phone Input */
.phone-input-container {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 12px;
  padding: 0 16px;
  height: 56px;
  gap: 12px;
}

.country-code {
  font-size: 16px;
  font-weight: 500;
  color: #000000;
  min-width: 40px;
}

.phone-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: #000000;
  outline: none;
}

.phone-input::placeholder {
  color: #999999;
}

/* Register Button */
.register-button {
  width: 100%;
  height: 56px;
  background: #007AFF;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.register-button:active {
  background: #0056CC;
}

/* Terms Text */
.terms-text {
  font-size: 12px;
  color: #666666;
  line-height: 1.5;
  text-align: center;
  padding: 0 8px;
}

.terms-text .link {
  color: #007AFF;
  text-decoration: underline;
}

/* Keypad Section */
.keypad-section {
  background: #e5e5e5;
  padding: 8px;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  max-width: 400px;
  margin: 0 auto;
}

.keypad-key {
  aspect-ratio: 1;
  background: #ffffff;
  border: none;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.1s;
  font-size: 24px;
  font-weight: 400;
  color: #000000;
  min-height: 60px;
}

.keypad-key:active {
  background: #e0e0e0;
}

.key-empty {
  background: transparent;
  cursor: default;
}

.key-empty:active {
  background: transparent;
}

.key-delete {
  font-size: 20px;
}

.key-number {
  font-size: 28px;
  font-weight: 300;
  line-height: 1;
}

.key-letters {
  font-size: 10px;
  font-weight: 400;
  color: #666666;
  margin-top: 2px;
  letter-spacing: 0.5px;
}

.delete-icon {
  font-size: 20px;
  color: #000000;
  font-weight: 300;
}

/* Responsive */
@media (max-width: 375px) {
  .main-content {
    padding: 24px 16px;
  }
  
  .keypad-key {
    min-height: 55px;
  }
  
  .key-number {
    font-size: 24px;
  }
}

@media (min-width: 768px) {
  .rupiah-cepat-page {
    max-width: 414px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}
</style>
