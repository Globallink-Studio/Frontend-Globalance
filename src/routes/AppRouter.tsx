import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import DashboardLayout from '../components/layout/DashboardLayout'
import Home from '../pages/public/Home'
import Dashboard from '../pages/private/Dashboard'
import WalletSummary from '../pages/private/wallet/WalletSummary'
import Transactions from '../pages/private/Transactions'
import GroupsLayout from '../pages/private/groups/GroupsLayout'
import MyGroups from '../pages/private/groups/MyGroups'
import CreateGroup from '../pages/private/groups/CreateGroup'
import GroupLayout from '../pages/private/groups/group/GroupLayout'
import GroupSummary from '../pages/private/groups/group/GroupSummary'
import GroupParticipants from '../pages/private/groups/group/GroupParticipants'
import GroupBalance from '../pages/private/groups/group/GroupBalance'
import GroupHistory from '../pages/private/groups/group/GroupHistory'
import GroupSettings from '../pages/private/groups/group/GroupSettings'
import Exchange from '../pages/private/Exchange'
import ProfileLayout from '../pages/private/profile/ProfileLayout'
import PersonalData from '../pages/private/profile/PersonalData'
import Cards from '../pages/private/profile/Cards'
import ProfileContacts from '../pages/private/profile/Contacts'
import NotificationsSettings from '../pages/private/profile/NotificationsSettings'
import TermsAndConditions from '../pages/private/profile/TermsAndConditions'
import Assistant from '../pages/private/Assistant'
import SigninAuth from '../pages/public/signinAuth'
import SignupAuth from '../pages/public/signupAuth'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SigninAuth />} />
        <Route path="/signup" element={<SignupAuth />} />

        {/* Private */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />

          {/* Wallet */}
          <Route path="wallet" element={<WalletSummary />} />

          {/* Transactions */}
          <Route path="transactions" element={<Transactions />} />
          <Route path="history" element={<Navigate to="/dashboard/transactions" replace />} />

          {/* Groups */}
          <Route path="groups" element={<GroupsLayout />}>
            <Route index element={<MyGroups />} />
            <Route path="create" element={<CreateGroup />} />
            <Route path=":groupId" element={<GroupLayout />}>
              <Route index element={<GroupSummary />} />
              <Route path="participants" element={<GroupParticipants />} />
              <Route path="balance" element={<GroupBalance />} />
              <Route path="history" element={<GroupHistory />} />
              <Route path="settings" element={<GroupSettings />} />
            </Route>
          </Route>

          {/* Exchange */}
          <Route path="exchange" element={<Exchange />} />

          {/* Contacts & Notifications */}
          <Route path="contacts" element={<ProfileContacts />} />
          <Route path="notifications" element={<NotificationsSettings />} />

          {/* Cards */}
          <Route path="cards" element={<Cards />} />
          <Route path="terms" element={<TermsAndConditions />} />

          {/* Profile */}
          <Route path="profile" element={<ProfileLayout />}>
            <Route index element={<PersonalData />} />
          </Route>

          {/* Assistant */}
          <Route path="assistant" element={<Assistant />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
