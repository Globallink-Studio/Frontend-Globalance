import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  User,
  Pencil,
  Trash2,
  ChevronDown,
  Star,
  Tag,
} from 'lucide-react'
import { getCurrentContacts, createContact, deleteContact, setContactFavorite, setContactCategory } from '../../../api/contacts'
import { getCategories, addCategory, deleteCategory, renameCategory } from '../../../api/contactCategories'
import { getFriendlyErrorMessage } from '../../../api/errors'
import Modal from '../../../components/Modal'
import TransferWizard from '../../../components/TransferWizard'
import Pagination from '../../../components/Pagination'
import type { Contact } from '../../../mocks/data/contacts'
import '../../../styles/pages/private/profile.css'
import '../../../styles/pages/private/transactions.css'
import '../../../styles/pages/private/contacts.css'

const tintClasses = ['contacts-avatar--lilac', 'contacts-avatar--sky', 'contacts-avatar--mint', 'contacts-avatar--peach', 'contacts-avatar--blush']

const CONTACTS_PER_PAGE = 10

function getInitials(name: string): string {
  return name.trim().charAt(0).toUpperCase()
}

type FilterKey = 'all' | string

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [favOnly, setFavOnly] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [viewing, setViewing] = useState<Contact | null>(null)
  const [deleting, setDeleting] = useState<Contact | null>(null)
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [categoryFor, setCategoryFor] = useState<Contact | null>(null)
  const [categoryForValue, setCategoryForValue] = useState('')
  const [catAssignOpen, setCatAssignOpen] = useState(false)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [catMenuOpen, setCatMenuOpen] = useState(false)
  const [deleteCatOpen, setDeleteCatOpen] = useState(false)
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false)
  const [editCategoryName, setEditCategoryName] = useState('')
  const [editCategoryValue, setEditCategoryValue] = useState('')
  const [editCatMenuOpen, setEditCatMenuOpen] = useState(false)
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [confirmCats, setConfirmCats] = useState<string[] | null>(null)
  const [deletingCats, setDeletingCats] = useState(false)
  const [alias, setAlias] = useState('')
  const [contactType, setContactType] = useState<'alias' | 'account_number'>('alias')
  const [contactValue, setContactValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [transferOpen, setTransferOpen] = useState(false)
  const [transferStep, setTransferStep] = useState(1)
  const [transferContactId, setTransferContactId] = useState<string | undefined>(undefined)
  const [transferError, setTransferError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const catMenuRef = useRef<HTMLDivElement>(null)
  const editCatMenuRef = useRef<HTMLDivElement>(null)
  const menuForRef = useRef<string | null>(null)

  useEffect(() => {
    menuForRef.current = menuFor
  }, [menuFor])

  useEffect(() => {
    const closeMenus = (e: MouseEvent) => {
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) setCatMenuOpen(false)
      if (editCatMenuRef.current && !editCatMenuRef.current.contains(e.target as Node)) setEditCatMenuOpen(false)
      const openId = menuForRef.current
      if (openId) {
        const wrap = document.querySelector<HTMLElement>(`[data-menu="${openId}"]`)
        if (wrap && !wrap.contains(e.target as Node)) setMenuFor(null)
      }
    }
    document.addEventListener('pointerdown', closeMenus)
    return () => document.removeEventListener('pointerdown', closeMenus)
  }, [])

  const load = async () => {
    const [c, cats] = await Promise.all([getCurrentContacts(), getCategories()])
    setContacts(c)
    setCategories(cats)
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 4000)
    return () => clearTimeout(t)
  }, [message])

  const openCreate = () => {
    setAlias('')
    setContactType('alias')
    setContactValue('')
    setErrorMessage(null)
    setFormOpen(true)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    setSaving(true)
    try {
      await createContact({
        name: alias.trim(),
        contactType,
        contactValue: contactValue.trim(),
      })
      setMessage('Contacto agregado')
      setFormOpen(false)
      await load()
    } catch (err) {
      setErrorMessage(getFriendlyErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    setErrorMessage(null)
    try {
      await deleteContact(deleting.id)
      setDeleting(null)
      setMessage('Contacto eliminado')
      await load()
    } catch (err) {
      setErrorMessage(getFriendlyErrorMessage(err))
    }
  }

  const handleToggleFavorite = async (c: Contact) => {
    setErrorMessage(null)
    const favorite = !c.favorite
    try {
      await setContactFavorite(c.id, favorite)
      setContacts((prev) => prev.map((x) => (x.id === c.id ? { ...x, favorite } : x)))
    } catch (err) {
      setErrorMessage(getFriendlyErrorMessage(err))
    }
  }

  const openAssignCategory = (c: Contact) => {
    setCategoryFor(c)
    setCategoryForValue(c.category ?? '')
    setCatAssignOpen(false)
    setMenuFor(null)
    setErrorMessage(null)
  }

  const handleAssignCategory = async () => {
    if (!categoryFor) return
    setErrorMessage(null)
    const value = categoryForValue === '' ? null : categoryForValue
    try {
      await setContactCategory(categoryFor.id, value)
      setContacts((prev) => prev.map((x) => (x.id === categoryFor.id ? { ...x, category: value } : x)))
      setCategoryFor(null)
      setMessage(value ? 'Categoría asignada' : 'Categoría quitada')
    } catch (err) {
      setErrorMessage(getFriendlyErrorMessage(err))
    }
  }

  const handleAddCategory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    try {
      await addCategory(newCategory)
      await load()
      setCategoryModalOpen(false)
      setNewCategory('')
      setFilter(newCategory)
      setMessage('Categoría creada')
    } catch (err) {
      setErrorMessage(getFriendlyErrorMessage(err))
    }
  }

  const categoryCount = (name: string) => contacts.filter((c) => c.category === name).length

  const openEditCategory = () => {
    const first = categories[0] ?? ''
    setEditCategoryValue(first)
    setEditCategoryName(first)
    setEditCatMenuOpen(false)
    setErrorMessage(null)
    setEditCategoryModalOpen(true)
  }

  const handleRenameCategory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editCategoryValue) return
    setErrorMessage(null)
    try {
      const name = await renameCategory(editCategoryValue, editCategoryName)
      await load()
      setEditCategoryModalOpen(false)
      setEditCategoryName('')
      setFilter((f) => (f === editCategoryValue ? name : f))
      setMessage('Categoría renombrada')
    } catch (err) {
      setErrorMessage(getFriendlyErrorMessage(err))
    }
  }

  const handleConfirmDeleteCategories = async () => {
    if (!confirmCats || confirmCats.length === 0) return
    setDeletingCats(true)
    setErrorMessage(null)
    try {
      await Promise.all(confirmCats.map((name) => deleteCategory(name)))
      setConfirmCats(null)
      setDeleteCatOpen(false)
      setSelectedCats([])
      setFilter((f) => (confirmCats.includes(f) ? 'all' : f))
      setMessage('Categorías eliminadas')
      await load()
    } catch (err) {
      setErrorMessage(getFriendlyErrorMessage(err))
    } finally {
      setDeletingCats(false)
    }
  }

  const visible = useMemo(() => {
    let list = [...contacts]
    if (filter !== 'all') list = list.filter((c) => c.category === filter)
    if (favOnly) list = list.filter((c) => c.favorite)

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (c) =>
          c.alias.toLowerCase().includes(q) ||
          (c.contact_value ?? '').toLowerCase().includes(q),
      )
    }

    list.sort((a, b) => a.alias.localeCompare(b.alias, 'es', { sensitivity: 'base' }))

    return list
  }, [contacts, filter, query, favOnly])

  const totalPages = Math.max(1, Math.ceil(visible.length / CONTACTS_PER_PAGE))
  const paged = visible.slice((page - 1) * CONTACTS_PER_PAGE, page * CONTACTS_PER_PAGE)

  useEffect(() => {
    setPage(1)
  }, [filter, query, favOnly])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  return (
    <div className="profile-page">
      <div className="profile-body">
        <div className="min-w-0">
          <div className="contacts-search">
            <Search className="contacts-search__icon" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, empresa o cuenta..."
              className="contacts-search__input"
            />
          </div>

          <div className="mt-4 contacts-filterbar">
            <div className="contacts-filters">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`contacts-chip${filter === 'all' ? ' contacts-chip--active' : ''}`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setFavOnly(!favOnly)}
                className={`contacts-chip${favOnly ? ' contacts-chip--active' : ''}`}
              >
                <Star />
                Favoritos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(filter === cat ? 'all' : cat)}
                  className={`contacts-chip${filter === cat ? ' contacts-chip--active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="contacts-menu-wrap" ref={catMenuRef}>
              <button
                type="button"
                onClick={() => setCatMenuOpen(!catMenuOpen)}
                className="contacts-chip contacts-chip--icon"
                aria-label="Opciones de categorías"
                aria-expanded={catMenuOpen}
              >
                <MoreHorizontal />
              </button>
              {catMenuOpen && (
                <div className="contacts-menu">
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryModalOpen(true)
                      setCatMenuOpen(false)
                    }}
                    className="contacts-menu__btn btn-hover-edit"
                  >
                    <Plus />
                    Añadir categoría
                  </button>
                  <button
                    type="button"
                    disabled={categories.length === 0}
                    onClick={() => {
                      openEditCategory()
                      setCatMenuOpen(false)
                    }}
                    className="contacts-menu__btn btn-hover-edit"
                  >
                    <Pencil />
                    Editar categoría
                  </button>
                  <button
                    type="button"
                    disabled={categories.length === 0}
                    onClick={() => {
                      setSelectedCats([])
                      setDeleteCatOpen(true)
                      setCatMenuOpen(false)
                    }}
                    className="contacts-menu__btn btn-hover-danger"
                  >
                    <Trash2 />
                    Eliminar categoría
                  </button>
                </div>
              )}
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">Sin contactos que coincidan.</p>
          ) : (
            <div className="mt-4 contacts-list">
              {paged.map((c, i) => (
                <section key={c.id} className="profile-card contacts-card">
                  <div className="contacts-card__head">
                    <span className={`contacts-avatar ${tintClasses[i % tintClasses.length]}`}>
                      {getInitials(c.alias)}
                    </span>
                    <div className="contacts-card__body">
                      <div className="contacts-card__name">
                        <p>{c.alias}</p>
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(c)}
                          className={`contacts-card__star${c.favorite ? ' contacts-card__star--active' : ''}`}
                          aria-label={c.favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                          aria-pressed={c.favorite}
                        >
                          <Star />
                        </button>
                      </div>
                      <p className="contacts-card__role">
                        {c.category ? c.category : 'Sin categoría'}
                      </p>
                      <div className="contacts-card__badges">
                        <span className="contacts-badge">
                          {c.contact_type === 'account_number'
                            ? `N° cuenta ${c.contact_value ?? c.account ?? ''}`
                            : `Alias ${c.contact_value ?? c.alias}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="contacts-card__actions">
                    <button
                      type="button"
                      onClick={() => {
                        setTransferContactId(c.id)
                        setTransferStep(1)
                        setTransferError(null)
                        setTransferOpen(true)
                      }}
                      className="contacts-action"
                    >
                      <ArrowUpRight />
                      Enviar
                    </button>
                    <button type="button" onClick={() => setViewing(c)} className="contacts-action">
                      <User />
                      Ver perfil
                    </button>
                    <div className="contacts-menu-wrap" data-menu={c.id}>
                      <button
                        type="button"
                        onClick={() => setMenuFor(menuFor === c.id ? null : c.id)}
                        className="contacts-action__more"
                        aria-label="Más opciones"
                      >
                        <MoreHorizontal />
                      </button>
                      {menuFor === c.id && (
                        <div className="contacts-menu">
                          <button
                            type="button"
                            onClick={() => openAssignCategory(c)}
                            className="contacts-menu__btn btn-hover-edit"
                          >
                            <Tag />
                            Asignar categoría
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleting(c)
                              setMenuFor(null)
                            }}
                            className="contacts-menu__btn btn-hover-danger"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          )}

          {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
        </div>

        <aside className="profile-sidebar">
          <button type="button" onClick={openCreate} className="profile-edit__btn profile-edit__btn--primary">
            Añadir contacto
          </button>
          <section className="profile-card">
            <h2 className="profile-card__title">Resumen</h2>
            <div className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total contactos</span>
                <span className="text-lg font-semibold">{contacts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Categorías</span>
                <span className="text-sm font-medium">{categories.length}</span>
              </div>
            </div>
          </section>

          <section className="profile-card">
            <h2 className="profile-card__title">Acciones rápidas</h2>
            <div className="mt-3 contacts-quick">
              <button
                type="button"
                onClick={() => {
                  setTransferContactId(undefined)
                  setTransferStep(1)
                  setTransferError(null)
                  setTransferOpen(true)
                }}
                className="contacts-quick__btn"
              >
                <ArrowUpRight />
                Nueva transferencia
              </button>
              <button type="button" onClick={() => setCategoryModalOpen(true)} className="contacts-quick__btn">
                <Users />
                Añadir categoría
              </button>
            </div>
          </section>
        </aside>
      </div>

      {formOpen && (
        <div className="tx-modal">
          <div className="tx-modal__card">
            <h3 className="tx-modal__title">Añadir contacto</h3>
            <form onSubmit={handleSubmit} className="tx-form">
              <div className="tx-form__field">
                <label htmlFor="contact-alias" className="tx-form__label">Nombre de contacto</label>
                <input
                  id="contact-alias"
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="mamá"
                  className="tx-form__control"
                  required
                />
              </div>
              <div className="tx-form__field">
                <p className="tx-form__label">Tipo de identificación</p>
                <div className="tx-form__options">
                  <label className="tx-form__option">
                    <input
                      type="radio"
                      name="contactType"
                      value="alias"
                      checked={contactType === 'alias'}
                      onChange={() => setContactType('alias')}
                    />
                    Alias
                  </label>
                  <label className="tx-form__option">
                    <input
                      type="radio"
                      name="contactType"
                      value="account_number"
                      checked={contactType === 'account_number'}
                      onChange={() => setContactType('account_number')}
                    />
                    N° de cuenta
                  </label>
                </div>
              </div>
              <div className="tx-form__field">
                <label htmlFor="contact-value" className="tx-form__label">
                  {contactType === 'alias' ? 'Alias del destinatario' : 'Número de cuenta'}
                </label>
                <input
                  id="contact-value"
                  type="text"
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder={contactType === 'alias' ? 'juan.cash' : '0000000002'}
                  className="tx-form__control"
                  required
                />
              </div>
              {errorMessage && <p className="profile-edit__error" role="alert">{errorMessage}</p>}
              <div className="tx-review__actions">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  disabled={saving}
                  className="profile-edit__btn profile-edit__btn--ghost"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || alias.trim() === '' || contactValue.trim() === ''}
                  className="profile-edit__btn profile-edit__btn--primary"
                >
                  {saving ? 'Guardando...' : 'Añadir contacto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {categoryModalOpen && (
        <div className="tx-modal">
          <div className="tx-modal__card">
            <h3 className="tx-modal__title">Añadir categoría</h3>
            <form onSubmit={handleAddCategory} className="tx-form">
              <div className="tx-form__field">
                <label htmlFor="new-category" className="tx-form__label">Nombre de la categoría</label>
                <input
                  id="new-category"
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="alquiler"
                  className="tx-form__control"
                  required
                />
              </div>
              {errorMessage && <p className="profile-edit__error" role="alert">{errorMessage}</p>}
              <div className="tx-review__actions">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryModalOpen(false)
                    setNewCategory('')
                    setErrorMessage(null)
                  }}
                  className="profile-edit__btn profile-edit__btn--ghost"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={newCategory.trim() === ''} className="profile-edit__btn profile-edit__btn--primary">
                  Crear categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteCatOpen && (
        <div className="tx-modal">
          <div className="tx-modal__card">
            <h3 className="tx-modal__title">Eliminar categorías</h3>
            <p className="tx-modal__message">
              Selecciona las categorías que quieres eliminar. Los contactos que las tengan quedarán
              como «Sin categoría».
            </p>
            {categories.map((cat) => (
              <label key={cat} className="tx-form__option">
                <input
                  type="checkbox"
                  checked={selectedCats.includes(cat)}
                  onChange={(e) =>
                    setSelectedCats((prev) =>
                      e.target.checked ? [...prev, cat] : prev.filter((c) => c !== cat),
                    )
                  }
                />
                {cat}
                <span className="contacts-chip__count">{categoryCount(cat)} contacto(s)</span>
              </label>
            ))}
            {errorMessage && <p className="profile-edit__error" role="alert">{errorMessage}</p>}
            <div className="tx-review__actions">
              <button
                type="button"
                onClick={() => {
                  setDeleteCatOpen(false)
                  setSelectedCats([])
                }}
                className="profile-edit__btn profile-edit__btn--ghost"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={selectedCats.length === 0}
                onClick={() => setConfirmCats(selectedCats)}
                className="profile-edit__btn profile-edit__btn--primary"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmCats && (
        <div className="tx-modal">
          <div className="tx-modal__card">
            <h3 className="tx-modal__title">Confirmar eliminación</h3>
            <p className="tx-modal__message">
              {confirmCats.length === 1
                ? `La categoría «${confirmCats[0]}» tiene ${categoryCount(confirmCats[0])} contacto(s). Al eliminarla, quedarán sin categoría.`
                : `Las categorías ${confirmCats.map((c) => `«${c}»`).join(', ')} tienen en total ${confirmCats.reduce((acc, c) => acc + categoryCount(c), 0)} contacto(s). Al eliminarlas, quedarán sin categoría.`}
            </p>
            {errorMessage && <p className="profile-edit__error" role="alert">{errorMessage}</p>}
            <div className="tx-review__actions">
              <button
                type="button"
                disabled={deletingCats}
                onClick={() => setConfirmCats(null)}
                className="profile-edit__btn profile-edit__btn--ghost"
              >
                Volver
              </button>
              <button
                type="button"
                disabled={deletingCats}
                onClick={handleConfirmDeleteCategories}
                className="profile-edit__btn profile-edit__btn--danger"
              >
                {deletingCats ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editCategoryModalOpen && (
        <div className="tx-modal">
          <div className="tx-modal__card">
            <h3 className="tx-modal__title">Editar categoría</h3>
            <form onSubmit={handleRenameCategory} className="tx-form">
              <div className="tx-form__field">
                <label htmlFor="edit-category-select" className="tx-form__label">Categoría</label>
                <div className="contacts-select" ref={editCatMenuRef}>
                  <button
                    type="button"
                    id="edit-category-select"
                    onClick={() => setEditCatMenuOpen(!editCatMenuOpen)}
                    className="tx-form__control contacts-select__trigger"
                    aria-haspopup="listbox"
                    aria-expanded={editCatMenuOpen}
                  >
                    <span>{editCategoryValue || 'Elige una categoría'}</span>
                    <ChevronDown className="contacts-select__chevron" />
                  </button>
                  {editCatMenuOpen && (
                    <ul className="contacts-menu contacts-select__menu" role="listbox">
                      {categories.map((cat) => (
                        <li key={cat} role="option" aria-selected={cat === editCategoryValue}>
                          <button
                            type="button"
                            onClick={() => {
                              setEditCategoryValue(cat)
                              setEditCategoryName(cat)
                              setEditCatMenuOpen(false)
                            }}
                            className="contacts-menu__btn"
                          >
                            {cat}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="tx-form__field">
                <label htmlFor="edit-category-name" className="tx-form__label">Nombre de la categoría</label>
                <input
                  id="edit-category-name"
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  placeholder="clientes"
                  className="tx-form__control"
                  required
                />
              </div>
              {errorMessage && <p className="profile-edit__error" role="alert">{errorMessage}</p>}
              <div className="tx-review__actions">
                <button
                  type="button"
                  onClick={() => {
                    setEditCategoryModalOpen(false)
                    setEditCategoryName('')
                    setErrorMessage(null)
                  }}
                  className="profile-edit__btn profile-edit__btn--ghost"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={editCategoryName.trim() === ''} className="profile-edit__btn profile-edit__btn--primary">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewing && (
        <div className="tx-modal">
          <div className="tx-modal__card">
            <h3 className="tx-modal__title">Perfil de {viewing.alias}</h3>
            <dl className="tx-review__rows">
              <div className="tx-review__row">
                <dt className="tx-review__label">Nombre</dt>
                <dd className="tx-review__value">{viewing.alias}</dd>
              </div>
              <div className="tx-review__row">
                <dt className="tx-review__label">Tipo</dt>
                <dd className="tx-review__value">
                  {viewing.contact_type === 'account_number' ? 'Número de cuenta' : 'Alias'}
                </dd>
              </div>
              <div className="tx-review__row">
                <dt className="tx-review__label">Valor</dt>
                <dd className="tx-review__value">
                  {viewing.contact_type === 'account_number'
                    ? viewing.contact_value ?? viewing.account ?? '—'
                    : viewing.contact_value ?? viewing.alias}
                </dd>
              </div>
              <div className="tx-review__row">
                <dt className="tx-review__label">Categoría</dt>
                <dd className="tx-review__value">
                  {viewing.category ? viewing.category : 'Sin categoría'}
                </dd>
              </div>
              <div className="tx-review__row">
                <dt className="tx-review__label">Agregado el</dt>
                <dd className="tx-review__value">
                  {viewing.created_at
                    ? new Date(viewing.created_at).toLocaleDateString('es-AR')
                    : '—'}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => setViewing(null)}
              className="profile-edit__btn profile-edit__btn--primary"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {categoryFor && (
        <div className="tx-modal">
          <div className="tx-modal__card">
            <h3 className="tx-modal__title">Asignar categoría</h3>
            <p className="tx-modal__message">Elige la categoría de «{categoryFor.alias}»</p>
            <div className="contacts-select">
              <button
                type="button"
                onClick={() => setCatAssignOpen(!catAssignOpen)}
                className="tx-form__control contacts-select__trigger"
                aria-haspopup="listbox"
                aria-expanded={catAssignOpen}
              >
                <span>{categoryForValue || 'Sin categoría'}</span>
                <ChevronDown className="contacts-select__chevron" />
              </button>
              {catAssignOpen && (
                <ul className="contacts-menu contacts-select__menu" role="listbox">
                  <li role="option" aria-selected={categoryForValue === ''}>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryForValue('')
                        setCatAssignOpen(false)
                      }}
                      className="contacts-menu__btn"
                    >
                      Sin categoría
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat} role="option" aria-selected={cat === categoryForValue}>
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryForValue(cat)
                          setCatAssignOpen(false)
                        }}
                        className="contacts-menu__btn"
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {errorMessage && <p className="profile-edit__error" role="alert">{errorMessage}</p>}
            <div className="tx-review__actions">
              <button
                type="button"
                onClick={() => {
                  setCategoryFor(null)
                  setErrorMessage(null)
                }}
                className="profile-edit__btn profile-edit__btn--ghost"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAssignCategory}
                className="profile-edit__btn profile-edit__btn--primary"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="tx-modal">
          <div className="tx-modal__card">
            <h3 className="tx-modal__title">Eliminar contacto</h3>
            <p className="tx-modal__message">¿Seguro que quieres eliminar a «{deleting.alias}»?</p>
            <div className="tx-review__actions">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="profile-edit__btn profile-edit__btn--ghost"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="profile-edit__btn profile-edit__btn--primary"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal open={transferOpen} onClose={() => setTransferOpen(false)} title="Transferir" step={transferStep} totalSteps={2}>
        <TransferWizard
          contacts={contacts}
          step={transferStep}
          setStep={setTransferStep}
          initialContactId={transferContactId}
          onDone={(msg) => {
            setTransferOpen(false)
            setTransferStep(1)
            setMessage(msg)
          }}
          onError={setTransferError}
          sending={sending}
          setSending={setSending}
        />
      </Modal>

      {transferError && (
        <div className="tx-modal">
          <div className="tx-modal__card">
            <h3 className="tx-modal__title">No se pudo realizar la operación</h3>
            <p className="tx-modal__message">{transferError}</p>
            <button
              type="button"
              onClick={() => setTransferError(null)}
              className="tx-button tx-button--primary tx-button--block"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {message && <div className="tx-toast">{message}</div>}
    </div>
  )
}
