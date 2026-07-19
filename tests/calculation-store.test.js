import { describe, expect, it } from "vitest";
import { deleteFavorite, favoritesKey, makeCalculationEntry, readFavorites, readHistory, saveFavorite, saveHistoryEntry } from "../src/storage/calculation-store.js";
import { calculationSummary } from "../src/storage/summaries.js";

describe("calculation storage", () => {
  it("keeps the newest 10 history entries per calculator", () => {
    const storage = memoryStorage();

    for (let index = 0; index < 12; index += 1) {
      saveHistoryEntry(storage, {
        id: String(index),
        createdAt: new Date().toISOString(),
        calculator: "dose",
        summary: `entry ${index}`,
        values: {},
      });
    }

    for (let index = 0; index < 12; index += 1) {
      saveHistoryEntry(storage, {
        id: `dilution-${index}`,
        createdAt: new Date().toISOString(),
        calculator: "dilution",
        summary: `entry ${index}`,
        values: {},
      });
    }

    const history = readHistory(storage);
    expect(history).toHaveLength(20);
    expect(readHistory(storage, "dose")).toHaveLength(10);
    expect(readHistory(storage, "dose")[0].id).toBe("11");
    expect(readHistory(storage, "dose")[9].id).toBe("2");
    expect(readHistory(storage, "dilution")).toHaveLength(10);
  });

  it("saves and deletes favorites", () => {
    const storage = memoryStorage();
    const entry = makeCalculationEntry("dose", "125 mg", { requiredDose: "125" }, "test");

    saveFavorite(storage, entry);
    expect(readFavorites(storage)).toHaveLength(1);
    expect(JSON.parse(storage.getItem(favoritesKey))[0].name).toBe("test");

    deleteFavorite(storage, entry.id);
    expect(readFavorites(storage)).toEqual([]);
  });
});

describe("calculation summaries", () => {
  it("creates a short dose summary", () => {
    expect(
      calculationSummary("dose", {
        requiredDose: "125",
        requiredDoseUnit: "mg",
        availableAmount: "250",
        availableAmountUnit: "mg",
        availableVolume: "5",
        availableVolumeUnit: "mL",
      }),
    ).toBe("125 mg от 250 mg в 5 mL");
  });
});

function memoryStorage() {
  const data = new Map();

  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
}
