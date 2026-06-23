import { AccountSettings } from './_components/account-settings';
import { ProfileSettings } from './_components/profile-settings';
import { SettingsHeader } from './_components/settings-header';

export default function SettingsPage() {
  return (
    <div className="pb-10">
      <SettingsHeader />

      <div className="mt-6 grid max-w-6xl gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <ProfileSettings />

        <AccountSettings />
      </div>
    </div>
  );
}