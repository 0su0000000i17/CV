type Props = {
  isSuccessMessage: boolean;
  extractionMessage: string;
  preparedVacancyTextLength: number;
};

export function VacancyStatusMessage({
  isSuccessMessage,
  extractionMessage,
  preparedVacancyTextLength,
}: Props) {
  if (!extractionMessage) {
    return null;
  }

  return (
    <div
      className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
        isSuccessMessage
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
          : 'border-border bg-background text-muted-foreground'
      }`}
    >
      <p>{extractionMessage}</p>

      {isSuccessMessage && preparedVacancyTextLength > 0 ? (
        <p className="mt-1 text-xs opacity-80">
          Подготовлено символов: {preparedVacancyTextLength}
        </p>
      ) : null}
    </div>
  );
}
