export const historyKey = "dozator-history";
export const favoritesKey = "dozator-favorites";
const historyLimit = 10;

export function saveHistoryEntry(storage, entry) {
  const entries = [entry, ...readEntries(storage, historyKey)];
  writeEntries(storage, historyKey, trimHistoryByCalculator(entries));
}

export function readHistory(storage, calculator = null) {
  const entries = readEntries(storage, historyKey);
  return calculator ? entries.filter((entry) => entry.calculator === calculator) : entries;
}

export function clearHistory(storage) {
  writeEntries(storage, historyKey, []);
}

export function saveFavorite(storage, entry) {
  writeEntries(storage, favoritesKey, [entry, ...readEntries(storage, favoritesKey)]);
}

export function readFavorites(storage) {
  return readEntries(storage, favoritesKey);
}

export function deleteFavorite(storage, id) {
  writeEntries(
    storage,
    favoritesKey,
    readEntries(storage, favoritesKey).filter((entry) => entry.id !== id),
  );
}

export function makeCalculationEntry(calculator, summary, values, name = "") {
  const createdAt = new Date().toISOString();

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt,
    calculator,
    summary,
    name: name.trim(),
    values: { ...values },
  };
}

function readEntries(storage, key) {
  try {
    const parsed = JSON.parse(storage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEntries(storage, key, entries) {
  storage.setItem(key, JSON.stringify(entries));
}

function trimHistoryByCalculator(entries) {
  const counts = {};

  return entries.filter((entry) => {
    counts[entry.calculator] ||= 0;
    counts[entry.calculator] += 1;
    return counts[entry.calculator] <= historyLimit;
  });
}
