export const clientWorkDateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export function dateToInputValue(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : "";
}
