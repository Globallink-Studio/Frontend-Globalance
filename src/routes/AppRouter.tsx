import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import DashboardLayout from '../components/layout/DashboardLayout'
import Home from '../pages/public/Home'
import Dashboard from '../pages/private/Dashboard'
import WalletLayout from '../pages/private/wallet/WalletLayout'
import WalletSummary from '../pages/private/wallet/WalletSummary'
import WalletAccounts from '../pages/private/wallet/WalletAccounts'
import AccountDetail from '../pages/private/wallet/AccountDetail'
import WalletContacts from '../pages/private/wallet/WalletContacts'
import TransactionsLayout from '../pages/private/transactions/TransactionsLayout'
import TransactionsSummary from '../pages/private/transactions/TransactionsSummary'
import History from '../pages/private/History'
import Transfers from '../pages/private/transactions/Transfers'
import Deposits from '../pages/private/transactions/Deposits'
import Conversions from '../pages/private/transactions/Conversions'
import MoneyRequests from '../pages/private/transactions/MoneyRequests'
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
import EditProfile from '../pages/private/profile/EditProfile'
import Cards from '../pages/private/profile/Cards'
import ProfileContacts from '../pages/private/profile/Contacts'
import NotificationsSettings from '../pages/private/profile/NotificationsSettings'
import Settings from '../pages/private/profile/Settings'
import Search from '../pages/private/Search'
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
          <Route path="wallet" element={<WalletLayout />}>
            <Route index element={<WalletSummary />} />
            <Route path="accounts" element={<WalletAccounts />} />
            <Route path="accounts/:currency" element={<AccountDetail />} />
            <Route path="history" element={<History />} />
            <Route path="contacts" element={<WalletContacts />} />
          </Route>

          {/* Transactions */}
          <Route path="transactions" element={<TransactionsLayout />}>
            <Route index element={<TransactionsSummary />} />
            <Route path="history" element={<History />} />
            <Route path="transfers" element={<Transfers />} />
            <Route path="deposits" element={<Deposits />} />
            <Route path="conversions" element={<Conversions />} />
            <Route path="requests" element={<MoneyRequests />} />
          </Route>

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

          {/* Profile */}
          <Route path="profile" element={<ProfileLayout />}>
            <Route index element={<PersonalData />} />
            <Route path="edit" element={<EditProfile />} />
            <Route path="cards" element={<Cards />} />
            <Route path="contacts" element={<ProfileContacts />} />
            <Route path="notifications" element={<NotificationsSettings />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Search & Assistant */}
          <Route path="search" element={<Search />} />
          <Route path="assistant" element={<Assistant />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
