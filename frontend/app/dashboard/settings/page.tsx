import { AccountSettings } from "./_components/AccountSettings";
import { ProfileSettings } from "./_components/ProfileSettings";
import { SettingsHeader } from "./_components/SettingsHeader";

export default function SettingsPage() {
  return (
    <div>
      <SettingsHeader />

      <div className="max-w-3xl">
        <ProfileSettings />
        <AccountSettings />
      </div>
    </div>
  );
}
