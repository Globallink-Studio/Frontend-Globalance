import { getContactCategories as getMockCategories, addContactCategory as addMockCategory, deleteContactCategory as deleteMockCategory, renameContactCategory as renameMockCategory } from '../mocks/handlers/contactCategories'
import { getCurrentUserId } from './auth'
import { clearContactMetaCategory, renameContactMetaCategory } from './contactMeta'

export async function getCategories(): Promise<string[]> {
  return getMockCategories()
}

export async function addCategory(name: string): Promise<string> {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Indicá el nombre de la categoría')
  return addMockCategory(trimmed)
}

export async function deleteCategory(name: string): Promise<void> {
  const userId = getCurrentUserId()
  if (userId) clearContactMetaCategory(userId, name)
  return deleteMockCategory(name)
}

export async function renameCategory(oldName: string, newName: string): Promise<string> {
  const userId = getCurrentUserId()
  const renamed = await renameMockCategory(oldName, newName)
  if (userId) renameContactMetaCategory(userId, oldName, renamed)
  return renamed
}
