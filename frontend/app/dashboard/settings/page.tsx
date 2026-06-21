import { AccountSettings } from './_components/AccountSettings';
import { ProfileSettings } from './_components/ProfileSettings';
import { SettingsHeader } from './_components/SettingsHeader';

export default function SettingsPage() {
  return (
    <div className="pb-10">
      <SettingsHeader />

      <div className="mt-10 max-w-4xl space-y-6">
        <ProfileSettings />
        <AccountSettings />
      </div>
    </div>
  );
}
