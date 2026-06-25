import type { AdaptationSettings } from '@/src/shared/api/resume-adaptation';

type SettingKey = keyof AdaptationSettings;

const settings: { key: SettingKey; label: string }[] = [
  {
    key: 'preserveAuthorStyle',
    label: 'Сохранить стиль автора',
  },
  {
    key: 'strengthenAchievements',
    label: 'Усилить достижения',
  },
  {
    key: 'optimizeForAts',
    label: 'Оптимизировать под ATS',
  },
  {
    key: 'tailorSkillsToVacancy',
    label: 'Подстроить навыки под вакансию',
  },
  {
    key: 'makeTextMoreSpecific',
    label: 'Сделать текст более конкретным',
  },
];

type Props = {
  settings: AdaptationSettings;
  onSettingsChange: (settings: AdaptationSettings) => void;
};

export function AdaptSettings({ settings: value, onSettingsChange }: Props) {
  function handleToggle(key: SettingKey) {
    onSettingsChange({
      ...value,
      [key]: !value[key],
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <h2 className="text-xl font-medium text-foreground">
        Настройки адаптации
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Эти параметры будут влиять на то, как сервис перепишет резюме.
      </p>

      <div className="mt-4 space-y-2">
        {settings.map((item) => (
          <label
            key={item.key}
            className="flex min-h-[40px] cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-3 py-2 transition-colors hover:bg-muted"
          >
            <input
              type="checkbox"
              checked={value[item.key]}
              onChange={() => handleToggle(item.key)}
              className="h-3.5 w-3.5 shrink-0 cursor-pointer accent-foreground"
            />

            <span className="text-sm leading-snug text-foreground">
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}