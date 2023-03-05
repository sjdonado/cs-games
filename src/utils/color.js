export function getColorByIndex(index) {
  const r = (index * 20) % 256;
  const g = (index * 30) % 256;
  const b = (index * 40) % 256;

  return `rgb(${r}, ${g}, ${b})`;
}
