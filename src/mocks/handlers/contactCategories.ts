import { delay } from '../delay'
import { getMockContactCategories, addMockContactCategory, deleteMockContactCategory, renameMockContactCategory } from '../storage'

export async function getContactCategories(): Promise<string[]> {
  await delay()
  return getMockContactCategories()
}

export async function addContactCategory(name: string): Promise<string> {
  await delay()
  const trimmed = name.trim().toLowerCase()
  if (!trimmed) throw new Error('Indicá el nombre de la categoría')
  addMockContactCategory(trimmed)
  return trimmed
}

export async function deleteContactCategory(name: string): Promise<void> {
  await delay()
  deleteMockContactCategory(name)
}

export async function renameContactCategory(oldName: string, newName: string): Promise<string> {
  await delay()
  const trimmed = newName.trim().toLowerCase()
  if (!trimmed) throw new Error('Indicá el nombre de la categoría')
  if (getMockContactCategories().includes(trimmed)) throw new Error('Ya existe una categoría con ese nombre')
  renameMockContactCategory(oldName, trimmed)
  return trimmed
}
