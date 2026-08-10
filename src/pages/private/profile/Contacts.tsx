import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Search,
  Plus,
  Star,
  MoreHorizontal,
  ArrowUpRight,
  Clock,
  User,
  Pencil,
  Trash2,
  ChevronDown,
} from 'lucide-react'
import { getCurrentContacts, createContact, updateContact, deleteContact } from '../../../api/contacts'
import { getCategories, addCategory, deleteCategory, renameCategory } from '../../../api/contactCategories'
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

type FilterKey = 'all' | 'favorites' | 'recent' | string

export default function Contacts() {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [viewing, setViewing] = useState<Contact | null>(null)
  const [deleting, setDeleting] = useState<Contact | null>(null)
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [catMenuOpen, setCatMenuOpen] = useState(false)
  const [deleteCatOpen, setDeleteCatOpen] = useState(false)
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false)
  const [editCategoryName, setEditCategoryName] = useState('')
  const [editCategoryValue, setEditCategoryValue] = useState('')
  const [editCatMenuOpen, setEditCatMenuOpen] = useState(false)
  const [formCatMenuOpen, setFormCatMenuOpen] = useState(false)
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  const [confirmCats, setConfirmCats] = useState<string[] | null>(null)
  const [deletingCats, setDeletingCats] = useState(false)
  const [alias, setAlias] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [account, setAccount] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const catMenuRef = useRef<HTMLDivElement>(null)
  const formCatMenuRef = useRef<HTMLDivElement>(null)
  const editCatMenuRef = useRef<HTMLDivElement>(null)
  const menuForRef = useRef<string | null>(null)

  useEffect(() => {
    menuForRef.current = menuFor
  }, [menuFor])

  useEffect(() => {
    const closeMenus = (e: MouseEvent) => {
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) setCatMenuOpen(false)
      if (formCatMenuRef.current && !formCatMenuRef.current.contains(e.target as Node)) setFormCatMenuOpen(false)
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
    setEditing(null)
    setAlias('')
    setPhone('')
    setEmail('')
    setCategory('')
    setDescription('')
    setAccount('')
    setFormCatMenuOpen(false)
    setErrorMessage(null)
    setFormOpen(true)
  }

  const openEdit = (contact: Contact) => {
    setEditing(contact)
    setAlias(contact.alias)
    setPhone(contact.phone ?? '')
    setEmail(contact.email ?? '')
    setCategory(contact.category ?? '')
    setDescription(contact.description ?? '')
    setAccount(contact.account ?? '')
    setFormCatMenuOpen(false)
    setErrorMessage(null)
    setMenuFor(null)
    setFormOpen(true)
  }

  const toggleFavorite = async (contact: Contact) => {
    try {
      await updateContact(contact.id, { favorite: !contact.favorite })
      await load()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo actualizar el favorito')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    setSaving(true)
    try {
      const payload = {
        alias: alias.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        category: category.trim() || null,
        description: description.trim() || null,
        account: account.trim() || null,
      }
      if (editing) {
        await updateContact(editing.id, {
          alias: alias.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          category: category.trim() || null,
          description: description.trim() || null,
          account: account.trim() || null,
        })
        setMessage('Contacto actualizado')
      } else {
        await createContact({ recipientUserId: crypto.randomUUID(), ...payload })
        setMessage('Contacto agregado')
      }
      setFormOpen(false)
      await load()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo guardar el contacto')
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
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo eliminar el contacto')
    }
  }

  const handleAddCategory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    try {
      const name = await addCategory(newCategory)
      await load()
      setCategoryModalOpen(false)
      setNewCategory('')
      setCategory(name)
      setFilter(name)
      setMessage('Categoría creada')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo crear la categoría')
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
      setErrorMessage(err instanceof Error ? err.message : 'No se pudo renombrar la categoría')
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
      setErrorMessage(err instanceof Error ? err.message : 'No se pudieron eliminar las categorías')
    } finally {
      setDeletingCats(false)
    }
  }

  const visible = useMemo(() => {
    let list = [...contacts]
    if (filter === 'favorites') list = list.filter((c) => c.favorite)
    else if (filter === 'recent') list.sort((a, b) => b.created_at.localeCompare(a.created_at))
    else if (filter !== 'all') list = list.filter((c) => c.category === filter)

    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (c) =>
          c.alias.toLowerCase().includes(q) ||
          (c.account ?? '').toLowerCase().includes(q) ||
          (c.email ?? '').toLowerCase().includes(q),
      )
    }

    if (filter !== 'recent') {
      list.sort((a, b) => {
        const fav = Number(b.favorite) - Number(a.favorite)
        if (fav !== 0) return fav
        return a.alias.localeCompare(b.alias, 'es', { sensitivity: 'base' })
      })
    }

    return list
  }, [contacts, filter, query])

  const totalPages = Math.max(1, Math.ceil(visible.length / CONTACTS_PER_PAGE))
  const paged = visible.slice((page - 1) * CONTACTS_PER_PAGE, page * CONTACTS_PER_PAGE)

  useEffect(() => {
    setPage(1)
  }, [filter, query])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const favoritesCount = contacts.filter((c) => c.favorite).length
  const recentActivity = useMemo(
    () =>
      [...contacts]
        .filter((c) => c.last_activity)
        .sort((a, b) => (b.last_activity ?? '').localeCompare(a.last_activity ?? ''))
        .slice(0, 3),
    [contacts],
  )

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
                onClick={() => setFilter('favorites')}
                className={`contacts-chip${filter === 'favorites' ? ' contacts-chip--active' : ''}`}
              >
                Favoritos
              </button>
              <button
                type="button"
                onClick={() => setFilter('recent')}
                className={`contacts-chip${filter === 'recent' ? ' contacts-chip--active' : ''}`}
              >
                Recientes
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
                          onClick={() => toggleFavorite(c)}
                          className={`contacts-card__star${c.favorite ? ' contacts-card__star--active' : ''}`}
                          title={c.favorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                          aria-pressed={c.favorite}
                          aria-label={c.favorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                        >
                          <Star />
                        </button>
                      </div>
                      <p className="contacts-card__role">
                        {c.category ? c.category : 'Sin categoría'}
                        {c.description ? ` • ${c.description}` : ''}
                      </p>
                      <div className="contacts-card__badges">
                        {c.email && <span className="contacts-badge">{c.email}</span>}
                        {c.account && (
                          <span className="contacts-badge">
                            {c.account}
                            {c.currency_code ? ` · ${c.currency_code}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="contacts-card__side">
                      <span className="contacts-card__amount">{c.last_amount ?? '—'}</span>
                      <span className="contacts-card__recent">
                        <Clock />
                        {c.last_activity ?? 'Sin actividad'}
                      </span>
                    </div>
                  </div>

                  <div className="contacts-card__actions">
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard/transactions/transfers')}
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
                          <button type="button" onClick={() => openEdit(c)} className="contacts-menu__btn btn-hover-edit">
                            Editar
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
                <span className="text-sm text-muted-foreground">Favoritos</span>
                <span className="text-sm font-medium">{favoritesCount}</span>
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
                onClick={() => navigate('/dashboard/transactions/transfers')}
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

          <section className="profile-card">
            <h2 className="profile-card__title">Última actividad</h2>
            <div className="mt-3 contacts-activity">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin actividad reciente.</p>
              ) : (
                recentActivity.map((c) => (
                  <div key={c.id} className="contacts-activity__item">
                    <div className="contacts-activity__main">
                      <p className="contacts-activity__name">{c.alias}</p>
                      <p className="contacts-activity__desc">
                        Último movimiento {c.last_amount ? `· ${c.last_amount}` : ''}
                      </p>
                    </div>
                    <span className="contacts-activity__time">{c.last_activity}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </aside>
      </div>

      {formOpen && (
        <div className="tx-modal">
          <div className="tx-modal__card">
            <h3 className="tx-modal__title">{editing ? 'Editar contacto' : 'Añadir contacto'}</h3>
            <form onSubmit={handleSubmit} className="tx-form">
              <div className="tx-form__field">
                <label htmlFor="contact-alias" className="tx-form__label">Alias</label>
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
                <label htmlFor="contact-phone" className="tx-form__label">Teléfono</label>
                <input
                  id="contact-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+54 11 5555-0000"
                  className="tx-form__control"
                />
              </div>
              <div className="tx-form__field">
                <label htmlFor="contact-category" className="tx-form__label">Categoría</label>
                <div className="contacts-select" ref={formCatMenuRef}>
                  <button
                    type="button"
                    id="contact-category"
                    onClick={() => setFormCatMenuOpen(!formCatMenuOpen)}
                    className="tx-form__control contacts-select__trigger"
                    aria-haspopup="listbox"
                    aria-expanded={formCatMenuOpen}
                  >
                    <span>{category || 'Sin categoría'}</span>
                    <ChevronDown className="contacts-select__chevron" />
                  </button>
                  {formCatMenuOpen && (
                    <ul className="contacts-menu contacts-select__menu" role="listbox">
                      <li role="option" aria-selected={category === ''}>
                        <button
                          type="button"
                          onClick={() => {
                            setCategory('')
                            setFormCatMenuOpen(false)
                          }}
                          className="contacts-menu__btn"
                        >
                          Sin categoría
                        </button>
                      </li>
                      {categories.map((cat) => (
                        <li key={cat} role="option" aria-selected={cat === category}>
                          <button
                            type="button"
                            onClick={() => {
                              setCategory(cat)
                              setFormCatMenuOpen(false)
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
                <label htmlFor="contact-description" className="tx-form__label">Descripción</label>
                <input
                  id="contact-description"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="cliente, proveedor, amigo..."
                  className="tx-form__control"
                />
              </div>
              <div className="tx-form__field">
                <label htmlFor="contact-email" className="tx-form__label">Correo electrónico</label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className="tx-form__control"
                />
              </div>
              <div className="tx-form__field">
                <label htmlFor="contact-account" className="tx-form__label">Cuenta</label>
                <input
                  id="contact-account"
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="Número de cuenta registrado"
                  className="tx-form__control"
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
                <button type="submit" disabled={saving || alias.trim() === ''} className="profile-edit__btn profile-edit__btn--primary">
                  {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Añadir contacto'}
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
              Seleccioná las categorías que querés eliminar. Los contactos que las tengan quedarán
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
                    <span>{editCategoryValue || 'Elegí una categoría'}</span>
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
                <dt className="tx-review__label">Alias</dt>
                <dd className="tx-review__value">{viewing.alias}</dd>
              </div>
              <div className="tx-review__row">
                <dt className="tx-review__label">Teléfono</dt>
                <dd className="tx-review__value">{viewing.phone ?? '—'}</dd>
              </div>
              <div className="tx-review__row">
                <dt className="tx-review__label">Correo electrónico</dt>
                <dd className="tx-review__value">{viewing.email ?? '—'}</dd>
              </div>
              <div className="tx-review__row">
                <dt className="tx-review__label">Categoría</dt>
                <dd className="tx-review__value">
                  {viewing.category ? viewing.category : 'Sin categoría'}
                  {viewing.description ? ` • ${viewing.description}` : ''}
                </dd>
              </div>
              <div className="tx-review__row">
                <dt className="tx-review__label">Cuenta</dt>
                <dd className="tx-review__value">
                  {viewing.account ?? '—'}
                  {viewing.currency_code ? ` · ${viewing.currency_code}` : ''}
                </dd>
              </div>
              <div className="tx-review__row">
                <dt className="tx-review__label">Favorito</dt>
                <dd className="tx-review__value">{viewing.favorite ? 'Sí' : 'No'}</dd>
              </div>
              <div className="tx-review__row">
                <dt className="tx-review__label">Agregado el</dt>
                <dd className="tx-review__value">
                  {new Date(viewing.created_at).toLocaleDateString('es-AR')}
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

      {deleting && (
        <div className="tx-modal">
          <div className="tx-modal__card">
            <h3 className="tx-modal__title">Eliminar contacto</h3>
            <p className="tx-modal__message">¿Seguro que querés eliminar a «{deleting.alias}»?</p>
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

      {message && <div className="tx-toast">{message}</div>}
    </div>
  )
}
