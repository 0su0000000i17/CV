'use client';

import { AccountSettingsCards } from './account-settings-cards';
import { DeleteAccountDialog } from './delete-account-dialog';
import { LogoutDialog } from './logout-dialog';
import { useAccountActions } from './use-account-actions';

export function AccountSettings() {
  const state = useAccountActions();
  return <>
    <AccountSettingsCards onLogout={state.openLogout} onDelete={state.openDelete} />
    <LogoutDialog open={state.logoutOpen} pending={state.isLoggingOut}
      error={state.logoutError} onCancel={() => state.setLogoutOpen(false)}
      onConfirm={state.logout} />
    <DeleteAccountDialog open={state.deleteOpen} pending={state.isDeleting}
      error={state.deleteError} onCancel={() => state.setDeleteOpen(false)}
      onConfirm={state.deleteAccount} />
  </>;
}
