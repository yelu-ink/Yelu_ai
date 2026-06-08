export function maskStudentName(name: string): string {
  const trimmed = name.trim();
  const len = trimmed.length;

  if (len === 0) {
    return '';
  }
  if (len === 1) {
    return '*';
  }
  if (len === 2) {
    return `${trimmed[0]}*`;
  }
  if (len === 3) {
    return `${trimmed[0]}*${trimmed[2]}`;
  }

  const start = Math.floor((len - 2) / 2);
  const chars = trimmed.split('');
  chars[start] = '*';
  chars[start + 1] = '*';
  return chars.join('');
}
