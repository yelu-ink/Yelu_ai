import { pinyin } from 'pinyin-pro'

export function convertToPinyin(name: string): string {
  return pinyin(name.trim(), { toneType: 'none', type: 'array' }).join('')
}

export function generateUsername(name: string): string {
  const result = convertToPinyin(name).toLowerCase().replace(/[^a-z0-9]/g, '')
  return result || 'student'
}

export function generatePassword(name: string): string {
  const base = generateUsername(name)
  const random = Math.floor(Math.random() * 900) + 100
  return `${base}${random}`
}
