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
          ? 'border-border bg-muted/50 text-foreground/75'
          : 'border-border bg-background text-muted-foreground'
      }`}
    >
      <p>{extractionMessage}</p>

      {isSuccessMessage && preparedVacancyTextLength > 0 ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Подготовлено символов: {preparedVacancyTextLength}
        </p>
      ) : null}
    </div>
  );
}
