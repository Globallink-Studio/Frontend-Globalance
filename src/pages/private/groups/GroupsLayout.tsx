import { Outlet, NavLink } from 'react-router-dom'

export default function GroupsLayout() {
  return (
    <div>
      <nav style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
        <NavLink
          to="/dashboard/groups"
          end
          style={({ isActive }) => ({ fontWeight: isActive ? 700 : 400, fontSize: 14 })}
        >
          Mis grupos
        </NavLink>
        <NavLink
          to="/dashboard/groups/create"
          style={({ isActive }) => ({ fontWeight: isActive ? 700 : 400, fontSize: 14 })}
        >
          Crear grupo
        </NavLink>
      </nav>
      <Outlet />
    </div>
  )
}
