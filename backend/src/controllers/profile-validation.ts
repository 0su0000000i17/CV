const forbiddenNamePattern =
  /(еблан|дебил|идиот|мудак|пидор|пидр|хуй|хуе|бля|сука|сучка|шлюха|мразь|гандон|гондон|чмо|уеб|уёб)/i;

export function validateFullName(value: string) {
  const normalized = value.trim();
  if (!normalized) return "Full name is required";
  if (normalized.length > 100) return "Full name must be 100 characters or fewer";
  if (forbiddenNamePattern.test(normalized)) return "Please enter a valid full name";
  return "";
}
