import { describe, test, expect } from "vitest";
import {
  normalizeModel,
  normalizeSize,
  normalizeDesign,
  canonicalKey,
  isValidSize,
  stockMatchKey,
  modelSizeKey,
  DE_EN_COLOR_MAP,
} from "../canonical-keys";

describe("normalizeModel", () => {
  test("normalizes model names to lowercase without spaces", () => {
    expect(normalizeModel("Miura 2 RS D-Lite")).toBe("miura2rsd-lite");
    expect(normalizeModel("Spitfire 3")).toBe("spitfire3");
    expect(normalizeModel("Connect Race Lite")).toBe("connectracelite");
  });

  test("handles empty and null input", () => {
    expect(normalizeModel("")).toBe("");
    expect(normalizeModel("   ")).toBe("");
  });

  test("removes special characters except hyphens", () => {
    expect(normalizeModel("Model (2023)")).toBe("model2023");
    expect(normalizeModel("D-Lite & Co.")).toBe("d-liteco");
    expect(normalizeModel("Test-Model")).toBe("test-model");
  });

  test("normalizes unicode characters", () => {
    expect(normalizeModel("Tübingen")).toBe("tubingen");
    expect(normalizeModel("Café")).toBe("cafe");
  });

  test("removes leading and trailing hyphens", () => {
    expect(normalizeModel("-Test-")).toBe("test");
    expect(normalizeModel("--Model--")).toBe("model");
  });

  test("preserves RS designation", () => {
    expect(normalizeModel("Miura 2 RS")).toBe("miura2rs");
    expect(normalizeModel("Test RS")).toBe("testrs");
  });
});

describe("normalizeSize", () => {
  test("normalizes letter sizes to lowercase", () => {
    expect(normalizeSize("S")).toBe("s");
    expect(normalizeSize("XL")).toBe("xl");
    expect(normalizeSize("XXS")).toBe("xxs");
  });

  test("converts comma to dot for decimal sizes", () => {
    expect(normalizeSize("8,5")).toBe("8.5");
    expect(normalizeSize("9,0")).toBe("9.0");
  });

  test("maps various 'one size' variants to 'uni'", () => {
    expect(normalizeSize("")).toBe("uni");
    expect(normalizeSize(null)).toBe("uni");
    expect(normalizeSize(undefined)).toBe("uni");
    expect(normalizeSize("Einheitsgröße")).toBe("uni");
    expect(normalizeSize("one size")).toBe("uni");
    expect(normalizeSize("OS")).toBe("uni");
    expect(normalizeSize("-")).toBe("uni");
  });

  test("normalizes unicode characters", () => {
    expect(normalizeSize("Größe")).toBe("grosse");
  });

  test("preserves numeric sizes", () => {
    expect(normalizeSize("30")).toBe("30");
    expect(normalizeSize("11")).toBe("11");
  });
});

describe("normalizeDesign", () => {
  test("translates German color names to English", () => {
    expect(normalizeDesign("Blau")).toBe("blue");
    expect(normalizeDesign("ROT")).toBe("red");
    expect(normalizeDesign("Grün")).toBe("green");
    expect(normalizeDesign("weiß")).toBe("white");
    expect(normalizeDesign("türkis")).toBe("turquoise");
  });

  test("keeps English color names as-is (lowercased)", () => {
    expect(normalizeDesign("Cosmic")).toBe("cosmic");
    expect(normalizeDesign("ENERGY")).toBe("energy");
    expect(normalizeDesign("Ocean")).toBe("ocean");
  });

  test("handles empty and null input", () => {
    expect(normalizeDesign("")).toBe("");
    expect(normalizeDesign(null)).toBe("");
    expect(normalizeDesign(undefined)).toBe("");
  });

  test("strips trailing punctuation", () => {
    expect(normalizeDesign("Blau:")).toBe("blue");
    expect(normalizeDesign("Red!!!")).toBe("red");
    expect(normalizeDesign("Green.")).toBe("green");
  });

  test("normalizes unicode characters", () => {
    expect(normalizeDesign("Grün")).toBe("green");
    expect(normalizeDesign("Türkis")).toBe("turquoise");
  });

  test("handles multi-word colors", () => {
    expect(normalizeDesign("hellblau")).toBe("light blue");
    expect(normalizeDesign("dunkelgrün")).toBe("dark green");
  });
});

describe("canonicalKey", () => {
  test("generates canonical key from model and size", () => {
    expect(canonicalKey("Miura 2 RS", "S")).toBe("miura2rs_s");
    expect(canonicalKey("Spitfire 3", "9,5")).toBe("spitfire3_9.5");
    expect(canonicalKey("Escape", "30")).toBe("escape_30");
  });

  test("handles null and undefined sizes", () => {
    expect(canonicalKey("Test Model", null)).toBe("testmodel_uni");
    expect(canonicalKey("Test Model", undefined)).toBe("testmodel_uni");
    expect(canonicalKey("Test Model", "")).toBe("testmodel_uni");
  });
});

describe("isValidSize", () => {
  test("validates known text sizes", () => {
    expect(isValidSize("s")).toBe(true);
    expect(isValidSize("xl")).toBe(true);
    expect(isValidSize("xxs")).toBe(true);
    expect(isValidSize("uni")).toBe(true);
    expect(isValidSize("medium")).toBe(true);
  });

  test("validates numeric sizes in range 7-50", () => {
    expect(isValidSize("7")).toBe(true);
    expect(isValidSize("30")).toBe(true);
    expect(isValidSize("50")).toBe(true);
    expect(isValidSize("8.5")).toBe(true);
    expect(isValidSize("9.5")).toBe(true);
  });

  test("rejects invalid sizes", () => {
    expect(isValidSize("6")).toBe(false); // Too small
    expect(isValidSize("51")).toBe(false); // Too large
    expect(isValidSize("abc")).toBe(false); // Invalid text
    expect(isValidSize("")).toBe(false); // Empty
    expect(isValidSize("8.5.5")).toBe(false); // Invalid format
  });

  test("rejects sizes with additional characters", () => {
    expect(isValidSize("8x")).toBe(false);
    expect(isValidSize("30cm")).toBe(false);
    expect(isValidSize("s-large")).toBe(false);
  });
});

describe("stockMatchKey", () => {
  test("generates full match key with model, design, and size", () => {
    expect(stockMatchKey("Miura 2 RS", "Blue", "S")).toBe("miura2rs||blue||s");
    expect(stockMatchKey("Spitfire 3", null, "9,5")).toBe("spitfire3||||9.5");
    expect(stockMatchKey("Escape", "Red", "30")).toBe("escape||red||30");
  });

  test("handles null and undefined values", () => {
    expect(stockMatchKey("Test", null, null)).toBe("test||||uni");
    expect(stockMatchKey("Test", undefined, undefined)).toBe("test||||uni");
  });
});

describe("modelSizeKey", () => {
  test("generates model+size key ignoring design", () => {
    expect(modelSizeKey("Miura 2 RS", "S")).toBe("miura2rs||s");
    expect(modelSizeKey("Spitfire 3", "9,5")).toBe("spitfire3||9.5");
    expect(modelSizeKey("Escape", "30")).toBe("escape||30");
  });

  test("handles null and undefined sizes", () => {
    expect(modelSizeKey("Test", null)).toBe("test||uni");
    expect(modelSizeKey("Test", undefined)).toBe("test||uni");
  });
});

describe("DE_EN_COLOR_MAP", () => {
  test("contains expected German to English mappings", () => {
    expect(DE_EN_COLOR_MAP.blau).toBe("blue");
    expect(DE_EN_COLOR_MAP.rot).toBe("red");
    expect(DE_EN_COLOR_MAP.grün).toBe("green");
    expect(DE_EN_COLOR_MAP.weiß).toBe("white");
    expect(DE_EN_COLOR_MAP.schwarz).toBe("black");
  });

  test("includes special characters mappings", () => {
    expect(DE_EN_COLOR_MAP["türkis"]).toBe("turquoise");
    expect(DE_EN_COLOR_MAP.tuerkis).toBe("turquoise");
  });

  test("includes compound colors", () => {
    expect(DE_EN_COLOR_MAP.hellblau).toBe("light blue");
    expect(DE_EN_COLOR_MAP.dunkelblau).toBe("dark blue");
    expect(DE_EN_COLOR_MAP.hellgruen).toBe("light green");
    expect(DE_EN_COLOR_MAP.dunkelgruen).toBe("dark green");
  });
});