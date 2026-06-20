import { FutureSettings } from "./_components/FutureSettings";
import { PreferenceSettings } from "./_components/PreferenceSettings";
import { ProfileSettings } from "./_components/ProfileSettings";
import { SecuritySettings } from "./_components/SecuritySettings";
import { SettingsHeader } from "./_components/SettingsHeader";

export default function SettingsPage() {
  return (
    <div>
      <SettingsHeader />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <ProfileSettings />
          <PreferenceSettings />
        </div>

        <aside className="space-y-6">
          <SecuritySettings />
          <FutureSettings />
        </aside>
      </div>
    </div>
  );
}