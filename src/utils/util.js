export function splitMessage(text, maxLength = 2000) {
  const parts = [];
  let current = 0;
  while (current < text.length) {
    parts.push(text.slice(current, current + maxLength));
    current += maxLength;
  }
  return parts;
}
