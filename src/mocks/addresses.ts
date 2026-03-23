// 地址 Mock 数据

export interface AddressMockData {
  id: number
  userId: number
  recipientName: string
  phone: string
  province: string
  city: string
  district: string
  detailAddress: string
  isDefault: boolean
}

// 地址存储
const ADDRESSES_KEY = 'mock_addresses'

// 获取所有地址
export const getAllAddresses = (): AddressMockData[] => {
  const addressesStr = localStorage.getItem(ADDRESSES_KEY)
  if (addressesStr) {
    try {
      return JSON.parse(addressesStr)
    } catch {
      return []
    }
  }
  return []
}

// 保存地址
const saveAddresses = (addresses: AddressMockData[]): void => {
  localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses))
}

// 获取用户地址列表
export const getUserAddresses = (userId: number): AddressMockData[] => {
  const addresses = getAllAddresses()
  return addresses.filter(a => a.userId === userId)
}

// 添加地址
export const addAddress = (
  userId: number,
  address: Omit<AddressMockData, 'id' | 'userId'>
): AddressMockData => {
  const addresses = getAllAddresses()
  
  // 如果设置为默认地址，取消其他默认地址
  if (address.isDefault) {
    addresses.forEach(a => {
      if (a.userId === userId) {
        a.isDefault = false
      }
    })
  }
  
  const newAddress: AddressMockData = {
    ...address,
    id: Math.max(...addresses.map(a => a.id), 0) + 1,
    userId
  }
  
  addresses.push(newAddress)
  saveAddresses(addresses)
  
  return newAddress
}

// 更新地址
export const updateAddress = (
  addressId: number,
  updates: Partial<Omit<AddressMockData, 'id' | 'userId'>>
): AddressMockData | null => {
  const addresses = getAllAddresses()
  const addressIndex = addresses.findIndex(a => a.id === addressId)
  
  if (addressIndex !== -1) {
    const address = addresses[addressIndex]
    
    // 如果设置为默认地址，取消其他默认地址
    if (updates.isDefault) {
      addresses.forEach(a => {
        if (a.userId === address.userId && a.id !== addressId) {
          a.isDefault = false
        }
      })
    }
    
    addresses[addressIndex] = { ...address, ...updates }
    saveAddresses(addresses)
    
    return addresses[addressIndex]
  }
  
  return null
}

// 删除地址
export const deleteAddress = (addressId: number): boolean => {
  const addresses = getAllAddresses()
  const addressIndex = addresses.findIndex(a => a.id === addressId)
  
  if (addressIndex !== -1) {
    addresses.splice(addressIndex, 1)
    saveAddresses(addresses)
    return true
  }
  
  return false
}

// 获取默认地址
export const getDefaultAddress = (userId: number): AddressMockData | undefined => {
  const addresses = getUserAddresses(userId)
  return addresses.find(a => a.isDefault)
}

// 设置默认地址
export const setDefaultAddress = (addressId: number): AddressMockData | null => {
  return updateAddress(addressId, { isDefault: true })
}
