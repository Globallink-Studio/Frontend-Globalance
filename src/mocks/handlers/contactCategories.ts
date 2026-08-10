import { delay } from '../delay'
import { getMockContactCategories, addMockContactCategory, deleteMockContactCategory, renameMockContactCategory } from '../storage'

export async function getContactCategories(): Promise<string[]> {
  await delay()
  return getMockContactCategories()
}

export async function addContactCategory(name: string): Promise<string> {
  await delay()
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Indicá el nombre de la categoría')
  if (getMockContactCategories().some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error('Ya existe una categoría con ese nombre')
  }
  addMockContactCategory(trimmed)
  return trimmed
}

export async function deleteContactCategory(name: string): Promise<void> {
  await delay()
  deleteMockContactCategory(name)
}

export async function renameContactCategory(oldName: string, newName: string): Promise<string> {
  await delay()
  const trimmed = newName.trim()
  if (!trimmed) throw new Error('Indicá el nombre de la categoría')
  if (
    getMockContactCategories().some(
      (c) => c !== oldName && c.toLowerCase() === trimmed.toLowerCase(),
    )
  ) {
    throw new Error('Ya existe una categoría con ese nombre')
  }
  renameMockContactCategory(oldName, trimmed)
  return trimmed
}
