import React from 'react'
import { NavLink } from 'react-router-dom'
import '../../styles/components/tabs.css'

interface TabsProps {
  items: { label: string; to: string; end?: boolean }[]
}

export const Tabs: React.FC<TabsProps> = ({ items }) => {
  return (
    <nav className="tabs">
      {items.map((tab) => (
        <NavLink
          key={tab.label}
          to={tab.to}
          end={tab.end ?? false}
          className={({ isActive }) =>
            `tabs__tab${isActive ? ' tabs__tab--active' : ''}`
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
