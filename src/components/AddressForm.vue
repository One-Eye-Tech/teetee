<template>
  <div class="order-detail">
    <button class="od-back" aria-label="返回" @click="$emit('back')"></button>
    <div class="header-row">
      <h2 class="page-title">{{ isEditing ? '编辑地址' : '新建地址' }}</h2>
    </div>
    <form class="address-form-container" @submit.prevent="handleSave">
      <div class="addr-card">
        <div class="form-row">
          <label>收货人姓名</label>
          <input class="input" v-model="form.name" required />
        </div>
        <div class="form-row">
          <label>手机号</label>
          <input 
            ref="phoneInput"
            class="input" 
            v-model="form.phone" 
            type="tel"
            maxlength="11"
            required 
            @input="handlePhoneInput"
            @blur="validatePhoneOnBlur"
          />
        </div>
        <div class="form-row">
          <label>所在地区</label>
          <div class="region-grid">
            <div class="cs-wrap" :class="{ open: provinceOpen }" ref="provinceWrapRef">
              <button type="button" class="cs-trigger" @click="provinceOpen = !provinceOpen">{{ provinceName || '请选择省份' }}</button>
              <span class="ef-caret" aria-hidden="true"></span>
              <ul v-if="provinceOpen" class="cs-panel" role="listbox">
                <li v-for="p in provinces" :key="p.code" class="cs-option" :class="{ active: form.province === p.code }" @click="selectProvince(p)" role="option">{{ p.name }}</li>
              </ul>
            </div>
            <div class="cs-wrap" :class="{ open: cityOpen }" ref="cityWrapRef">
              <button type="button" class="cs-trigger" :disabled="!cities.length" @click="cities.length && (cityOpen = !cityOpen)">{{ cityName || '请选择城市' }}</button>
              <span class="ef-caret" aria-hidden="true"></span>
              <ul v-if="cityOpen" class="cs-panel" role="listbox">
                <li v-for="c in cities" :key="c.code" class="cs-option" :class="{ active: form.city === c.code }" @click="selectCity(c)" role="option">{{ c.name }}</li>
              </ul>
            </div>
            <div class="cs-wrap" :class="{ open: areaOpen }" ref="areaWrapRef">
              <button type="button" class="cs-trigger" :disabled="!areas.length" @click="areas.length && (areaOpen = !areaOpen)">{{ areaName || '请选择区县' }}</button>
              <span class="ef-caret" aria-hidden="true"></span>
              <ul v-if="areaOpen" class="cs-panel" role="listbox">
                <li v-for="a in areas" :key="a.code" class="cs-option" :class="{ active: form.area === a.code }" @click="selectArea(a)" role="option">{{ a.name }}</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="form-row">
          <label>详细地址</label>
          <textarea class="input textarea" v-model="form.address" required rows="2"></textarea>
        </div>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn primary save-btn">保存</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { validatePhone, cleanPhone } from '../utils/validation'

// Props
interface Props {
  modelValue?: {
    name: string
    phone: string
    address: string
    province: string
    city: string
    area: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({ name: '', phone: '', address: '', province: '', city: '', area: '' })
})

// Emits
const emit = defineEmits<{
  back: []
  save: [address: { name: string; phone: string; address: string; province: string; city: string; area: string }]
}>()

// Form data
const form = ref({ ...props.modelValue })

// Check if editing (has initial data)
const isEditing = computed(() => {
  return props.modelValue.name !== '' || 
         props.modelValue.phone !== '' || 
         props.modelValue.address !== ''
})

// Region data
const provinces = ref<Array<{ code: string; name: string }>>([])
const cities = ref<Array<{ code: string; name: string }>>([])
const areas = ref<Array<{ code: string; name: string }>>([])

// Dropdown states
const provinceOpen = ref(false)
const cityOpen = ref(false)
const areaOpen = ref(false)

// Refs
const phoneInput = ref<HTMLInputElement>()
const provinceWrapRef = ref<HTMLElement>()
const cityWrapRef = ref<HTMLElement>()
const areaWrapRef = ref<HTMLElement>()

// Maps for quick lookup
const citiesMap = ref<Record<string, Array<{ code: string; name: string }>>>({})
const areasMap = ref<Record<string, Array<{ code: string; name: string }>>>({})

// Computed names
const provinceName = ref('')
const cityName = ref('')
const areaName = ref('')

// Load region data
onMounted(async () => {
  try {
    const [pRes, cRes, aRes] = await Promise.all([
      fetch('/address/provinces.json'),
      fetch('/address/cities.json'),
      fetch('/address/areas.json')
    ])
    provinces.value = await pRes.json()
    const citiesArr: Array<{ code: string; name: string; provinceCode: string }> = await cRes.json()
    const areasArr: Array<{ code: string; name: string; cityCode: string; provinceCode: string }> = await aRes.json()

    // Build maps
    const cMap: Record<string, Array<{ code: string; name: string }>> = {}
    for (const c of citiesArr) {
      if (!cMap[c.provinceCode]) cMap[c.provinceCode] = []
      cMap[c.provinceCode].push({ code: c.code, name: c.name })
    }
    const aMap: Record<string, Array<{ code: string; name: string }>> = {}
    for (const a of areasArr) {
      if (!aMap[a.cityCode]) aMap[a.cityCode] = []
      aMap[a.cityCode].push({ code: a.code, name: a.name })
    }
    citiesMap.value = cMap
    areasMap.value = aMap

    // Initialize current selections if form has values (editing mode)
    if (form.value.province) {
      initializeEditingData()
    }
  } catch (error) {
    console.error('Failed to load region data:', error)
  }

  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch for props changes (when editing different addresses)
watch(() => props.modelValue, (newValue) => {
  // Update form data
  form.value = { ...newValue }
  
  // Re-initialize region data if the province data is loaded
  if (Object.keys(citiesMap.value).length > 0 && newValue.province) {
    initializeEditingData()
  }
}, { deep: true })

// Initialize editing data (preserve existing values)
const initializeEditingData = () => {
  const provinceCode = form.value.province
  const cityCode = form.value.city
  const areaCode = form.value.area
  
  // Set province name
  provinceName.value = provinces.value.find(p => p.code === provinceCode)?.name || ''
  
  // Load cities for the province
  cities.value = citiesMap.value[provinceCode] || []
  
  // Set city name if city code exists
  if (cityCode && cities.value.length > 0) {
    cityName.value = cities.value.find(c => c.code === cityCode)?.name || ''
    
    // Load areas for the city
    areas.value = areasMap.value[cityCode] || []
    
    // Set area name if area code exists
    if (areaCode && areas.value.length > 0) {
      areaName.value = areas.value.find(a => a.code === areaCode)?.name || ''
    }
  }
}

// Update cities when province changes
const updateCities = () => {
  const code = form.value.province
  cities.value = citiesMap.value[code] || []
  areas.value = []
  form.value.city = ''
  form.value.area = ''
  cityName.value = '' // 清除城市名称显示
  areaName.value = '' // 清除区域名称显示
  provinceName.value = provinces.value.find(p => p.code === code)?.name || ''
}

// Update areas when city changes
const updateAreas = () => {
  const code = form.value.city
  areas.value = areasMap.value[code] || []
  form.value.area = ''
  areaName.value = '' // 清除区域名称显示
  cityName.value = cities.value.find(c => c.code === code)?.name || ''
}

// Selection handlers
const selectProvince = (p: { code: string; name: string }) => {
  form.value.province = p.code
  updateCities()
  provinceOpen.value = false
}

const selectCity = (c: { code: string; name: string }) => {
  form.value.city = c.code
  updateAreas()
  cityOpen.value = false
}

const selectArea = (a: { code: string; name: string }) => {
  form.value.area = a.code
  areaName.value = a.name
  areaOpen.value = false
}

// Handle click outside
const handleClickOutside = (e: Event) => {
  const t = e.target as Element
  if (provinceOpen.value && provinceWrapRef.value && !provinceWrapRef.value.contains(t)) provinceOpen.value = false
  if (cityOpen.value && cityWrapRef.value && !cityWrapRef.value.contains(t)) cityOpen.value = false
  if (areaOpen.value && areaWrapRef.value && !areaWrapRef.value.contains(t)) areaOpen.value = false
}

// 处理手机号输入
const handlePhoneInput = () => {
  // 只允许输入数字
  form.value.phone = form.value.phone.replace(/\D/g, '')
  // 清除错误状态
  phoneInput.value?.setCustomValidity('')
}

// 手机号失焦时校验
const validatePhoneOnBlur = () => {
  if (form.value.phone) {
    const phoneValidation = validatePhone(form.value.phone)
    if (!phoneValidation.isValid) {
      phoneInput.value?.setCustomValidity(phoneValidation.message)
      phoneInput.value?.reportValidity()
    }
  }
}

// Save handler
const handleSave = () => {
  const { name, phone, address, province, city, area } = form.value
  
  // 校验必填字段
  if (!name || !phone || !address || !province || !city || !area) {
    alert('请填写完整信息')
    return
  }
  
  // 校验手机号格式
  const phoneValidation = validatePhone(phone)
  if (!phoneValidation.isValid) {
    phoneInput.value?.setCustomValidity(phoneValidation.message)
    phoneInput.value?.reportValidity()
    return
  }
  
  // 清理手机号并提交
  const cleanedPhone = cleanPhone(phone)
  emit('save', { name, phone: cleanedPhone, address, province, city, area })
}
</script>

<style scoped>
.order-detail { 
  position: relative; 
  display: grid; 
  --od-pad-top: clamp(1.6rem, 3vh, 2rem); 
  --od-back-size: 3.8rem; 
  --od-gap: clamp(1.2rem, 2.6vw, 1.6rem); 
  gap: var(--od-gap); 
  padding: calc(2.6 * var(--od-pad-top)) var(--od-pad-x) var(--card-pad); 
}

.order-detail .od-back { 
  position: absolute; 
  top: calc(var(--od-pad-top) - 4.8rem); 
  left: calc(var(--od-pad-x) - 4rem); 
  width: 4.2rem; 
  height: 4.2rem; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 0; 
  background: var(--color-surface); 
  border: 1px solid var(--color-border); 
  border-radius: var(--radius-md); 
  color: var(--color-text); 
  cursor: pointer; 
  transition: all 0.2s ease; 
  box-shadow: none; 
  margin: 0; 
  z-index: 2;
}

.order-detail .od-back:hover { 
  background: color-mix(in srgb, var(--color-primary), transparent 92%);
  border-color: var(--color-primary);
  color: var(--color-text);
  transform: translateY(-2px); 
}

.order-detail .od-back::before { 
  content: ""; 
  position: absolute; 
  inset: 0; 
  margin: auto; 
  inline-size: clamp(1.8rem, 2.5vw, 2.2rem); 
  block-size: clamp(1.8rem, 2.5vw, 2.2rem); 
  background: var(--color-icon); 
  -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M15 6l-6 6 6 6' stroke='black' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center/contain no-repeat; 
  mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M15 6l-6 6 6 6' stroke='black' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center/contain no-repeat; 
}

.header-row {
  position: absolute;
  top: calc(var(--od-pad-top) - 4.8rem);
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 4.2rem;
}

.page-title {
  font-size: calc(var(--fs-md) * 1.1);
  font-weight: 500;
  color: var(--color-text);
  margin: 0;
  text-align: center;
}

.addr-card { 
  background: var(--color-card); 
  border-radius: var(--radius-md); 
  padding: calc(var(--od-pad-x) * 0.9) var(--od-pad-x) var(--od-pad-x) var(--od-pad-x);
  margin-left: -4rem; 
  margin-right: -4rem; 
  display: grid;
  gap: calc(var(--od-pad-x) * 0.9);
}

.address-form-container {
  margin: 0 calc(-1 * var(--od-pad-x)) 0 calc(-1 * var(--od-pad-x));
  padding: 0 var(--od-pad-x);
  inline-size: calc(100% + 2 * var(--od-pad-x));
  display: grid;
  gap: clamp(2.5rem, 5vw, 3.5rem);
  --field-h: clamp(4.4rem, 6vh, 5rem);
}

.addr-card .form-row { 
  display: grid; 
  gap: 1rem; 
}

.addr-card label {   
  font-size: var(--fs-sm);
  color: var(--color-text);
  font-weight: 500;
}

.addr-card .input,
.addr-card .select,
.addr-card .textarea {
  width: 100%;
  padding: clamp(1.2rem, 2vw, 1.5rem);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--fs-sm);
  font-weight: 500;
  line-height: 1.2;
  box-sizing: border-box;
  display: block;
  transition: border-color 0.2s ease;
  min-height: var(--field-h);
}

.addr-card .textarea {
  min-height: calc(var(--field-h) * 1.4);
  resize: vertical;
  font-family: inherit;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.addr-card .textarea::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

.addr-card .cs-wrap { 
  position: relative; 
}

.addr-card .cs-trigger {
  width: 100%;
  text-align: left;
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  align-items: center;
  gap: .6rem;
  cursor: pointer;
  padding: clamp(1.2rem, 2vw, 1.5rem);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: var(--fs-sm);
  line-height: 1.2;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
  min-height: var(--field-h);
}

.addr-card .cs-trigger[disabled] { 
  cursor: default; 
  color: var(--color-text-muted); 
  opacity: 1; 
}

.addr-card .cs-wrap .ef-caret { 
  right: 1rem; 
}

.addr-card .input::placeholder,
.addr-card .textarea::placeholder { 
  color: var(--color-text-muted); 
}

.addr-card .input:focus, .addr-card .input:focus-visible,
.addr-card .select:focus, .addr-card .select:focus-visible,
.addr-card .textarea:focus, .addr-card .textarea:focus-visible {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary), transparent 92%);
}

.addr-card .cs-trigger:focus,
.addr-card .cs-trigger:focus-visible {
  outline: none;
  border: 1px solid var(--color-primary);
}

.addr-card .cs-wrap.open .cs-trigger {
  border: 1px solid var(--color-primary);
}

.addr-card .cs-wrap.open .ef-caret {
  transform: translateY(-50%) rotate(180deg);
}

.addr-card .region-grid { 
  display: grid; 
  grid-template-columns: repeat(3, minmax(8rem, 1fr)); 
  gap: .8rem; 
}

.ef-caret { 
  position: absolute; 
  right: 1rem; 
  top: 50%; 
  transform: translateY(-50%); 
  inline-size: 1.5rem; 
  block-size: 1.5rem; 
  background: var(--color-icon); 
  -webkit-mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M6 9l6 6 6-6' stroke='black' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center/contain no-repeat; 
  mask: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M6 9l6 6 6-6' stroke='black' stroke-width='2' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>") center/contain no-repeat; 
  pointer-events: none; 
}

.cs-panel { 
  position: absolute; 
  left: 0; 
  right: 0; 
  top: calc(100% + .4rem); 
  background: var(--color-surface); 
  border: none; 
  border-radius: var(--radius-md); 
  box-shadow: 0 .6rem 1.6rem rgba(0,0,0,.18); 
  padding: .6rem; 
  margin: 0; 
  list-style: none; 
  z-index: 100; 
  max-height: 29.5rem; 
  overflow-y: auto; 
  scrollbar-width: none;
}

.cs-panel::-webkit-scrollbar {
  display: none;
}

.cs-option { 
  padding: clamp(1.2rem, 2vw, 1.5rem) 1rem; 
  border-radius: var(--radius-sm); 
  color: var(--color-text); 
  cursor: pointer; 
  font-size: var(--fs-sm); 
  line-height: 1.2; 
  min-height: calc(clamp(0.8rem, 1.5vw, 1rem) * 2 + 1.2em); 
  display: flex; 
  align-items: center; 
}

.cs-option + .cs-option { 
  margin-top: 0.6rem; 
}

.cs-option:hover { 
  background: var(--color-card); 
}

.cs-option.active { 
  background: var(--color-card); 
  color: var(--color-text); 
}

.form-actions {
  margin-top: calc(var(--od-pad-x) * 0.1);
  padding: 0;
  margin-left: -4rem;
  margin-right: -4rem;
  width: calc(100% + 8rem);
}

.btn {
  width: 100%;
  height: calc(var(--field-h) - .2rem);
  padding: 0;
  border-radius: var(--radius-sm);
  border: none;
  font-size: var(--fs-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.btn.primary {
  background: var(--color-primary);
  color: white;
}

.btn.primary:hover {
  background: color-mix(in srgb, var(--color-primary), black 10%);
  transform: translateY(-1px);
}

/* 移动端优化 */
@media (max-aspect-ratio: 1/1) {
  :root {
    --scale-factor: 2;
  }

  .order-detail {
    --od-pad-top: calc(clamp(1.6rem, 3vh, 2rem) * var(--scale-factor));
    --od-back-size: calc(3.8rem * var(--scale-factor));
    --od-gap: calc(clamp(1.2rem, 2.6vw, 1.6rem) * var(--scale-factor));
    gap: var(--od-gap);
    padding: calc(1.5 * var(--od-pad-top)) calc(var(--od-pad-x) * var(--scale-factor)) calc(var(--card-pad) * var(--scale-factor));
  }

  .order-detail .od-back {
    top: calc(var(--od-pad-top) - 3.5rem * var(--scale-factor));
    left: calc(var(--od-pad-x) * var(--scale-factor) - 4rem * var(--scale-factor));
    width: calc(4.5rem * var(--scale-factor));
    height: calc(4.5rem * var(--scale-factor));
    border-radius: calc(var(--radius-md) * var(--scale-factor));
  }

  .order-detail .od-back::before {
    inline-size: calc(clamp(1.8rem, 2.5vw, 2.2rem) * var(--scale-factor));
    block-size: calc(clamp(1.8rem, 2.5vw, 2.2rem) * var(--scale-factor));
  }

  .header-row {
    top: calc(var(--od-pad-top) - 3.5rem * var(--scale-factor));
    height: calc(4.2rem * var(--scale-factor));
  }

  .page-title {
    font-size: calc(var(--fs-md) * 1.1 * var(--scale-factor));
  }

  .addr-card {
    border-radius: calc(var(--radius-md) * var(--scale-factor));
    padding: calc(var(--od-pad-x) * 0.9 * var(--scale-factor)) calc(var(--od-pad-x) * var(--scale-factor)) calc(var(--od-pad-x) * var(--scale-factor)) calc(var(--od-pad-x) * var(--scale-factor));
    margin-left: calc(-4rem * var(--scale-factor));
    margin-right: calc(-4rem * var(--scale-factor));
    margin-top: 6rem;
    gap: calc(var(--od-pad-x) * 0.9 * var(--scale-factor));
  }

  .address-form-container {
    margin: 0 calc(-1 * var(--od-pad-x) * var(--scale-factor)) 0 calc(-1 * var(--od-pad-x) * var(--scale-factor));
    padding: 0 calc(var(--od-pad-x) * var(--scale-factor));
    inline-size: calc(100% + 2 * var(--od-pad-x) * var(--scale-factor));
    gap: calc(clamp(2.5rem, 5vw, 3.5rem) * var(--scale-factor));
    --field-h: calc(clamp(4.4rem, 6vh, 5rem) * var(--scale-factor));
  }

  .addr-card .form-row {
    gap: calc(1rem * var(--scale-factor));
  }

  .addr-card label {
    font-size: calc(var(--fs-sm) * var(--scale-factor));
  }

  .addr-card .input,
  .addr-card .select,
  .addr-card .textarea {
    padding: calc(clamp(1.2rem, 2vw, 1.5rem) * var(--scale-factor));
    border-radius: calc(var(--radius-md) * var(--scale-factor));
    font-size: calc(var(--fs-sm) * var(--scale-factor));
  }

  .region-grid {
    gap: calc(1rem * var(--scale-factor));
  }

  .addr-card .cs-trigger {
    border-radius: calc(var(--radius-md) * var(--scale-factor));
    font-size: calc(var(--fs-sm) * var(--scale-factor));
    padding: calc(clamp(1.2rem, 2vw, 1.5rem) * var(--scale-factor));
    gap: calc(.6rem * var(--scale-factor));
    min-height: var(--field-h);
  }

  .addr-card .cs-wrap .ef-caret {
    right: calc(1rem * var(--scale-factor));
  }

  .ef-caret {
    inline-size: calc(1.5rem * var(--scale-factor));
    block-size: calc(1.5rem * var(--scale-factor));
  }

  .cs-panel {
    top: calc(100% + .4rem * var(--scale-factor));
    border-radius: calc(var(--radius-md) * var(--scale-factor));
    padding: calc(.6rem * var(--scale-factor));
    box-shadow: 0 calc(.6rem * var(--scale-factor)) calc(1.6rem * var(--scale-factor)) rgba(0,0,0,.18);
    max-height: calc(29.5rem * var(--scale-factor));
  }

  .cs-option {
    padding: calc(clamp(1.2rem, 2vw, 1.5rem) * var(--scale-factor)) calc(1rem * var(--scale-factor));
    border-radius: calc(var(--radius-sm) * var(--scale-factor));
    font-size: calc(var(--fs-sm) * var(--scale-factor));
    min-height: calc((clamp(0.8rem, 1.5vw, 1rem) * 2 + 1.2em) * var(--scale-factor));
  }

  .cs-option + .cs-option {
    margin-top: calc(0.6rem * var(--scale-factor));
  }

  .form-actions {
    padding: 0;
    margin-left: calc(-4rem * var(--scale-factor));
    margin-right: calc(-4rem * var(--scale-factor));
    width: calc(100% + 8rem * var(--scale-factor));
    margin-top: calc(0.2rem * var(--scale-factor));
  }

  .btn.primary {
    width: 100%;
    height: calc((var(--field-h) - 5.3rem) * var(--scale-factor));
    font-size: calc(var(--fs-md) * var(--scale-factor));
    padding: 0;
    border-radius: calc(var(--radius-md) * var(--scale-factor));
  }
}
</style>