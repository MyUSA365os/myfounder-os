export function evidenceDate(value: string | null) {
  if (value === null) return "Unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
}

export function evidenceNumber(value: number | null | undefined) {
  return value == null ? "Unknown" : value.toLocaleString();
}

export function evidenceKnownAmount(value: number | null | undefined) {
  return value == null ? "Known amount unavailable" : evidenceNumber(value);
}
