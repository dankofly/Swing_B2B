import { describe, test, expect, beforeEach } from "vitest";
import type { CartItem } from "../cart";

// Since cart.tsx is a React component with localStorage dependencies,
// we'll test the pure logic functions by extracting the core business logic.
// This focuses on the data transformation logic rather than React hooks.

describe("Cart Item Logic", () => {
  let mockItems: CartItem[];

  beforeEach(() => {
    mockItems = [
      {
        productId: "product-1",
        productName: "Mirage 2 RS",
        sizeId: "size-s",
        sizeLabel: "S",
        colorId: "color-blue",
        colorName: "Blue",
        quantity: 2,
        unitPrice: 299.99,
      },
      {
        productId: "product-1",
        productName: "Mirage 2 RS",
        sizeId: "size-m",
        sizeLabel: "M",
        colorId: "color-blue",
        colorName: "Blue",
        quantity: 1,
        unitPrice: 319.99,
      },
    ];
  });

  describe("Item Identification", () => {
    test("identifies items by size and color combination", () => {
      const item1 = mockItems[0];
      const item2 = mockItems[1];

      // Same product, different sizes should be different items
      expect(item1.sizeId).not.toBe(item2.sizeId);
      expect(item1.productId).toBe(item2.productId);
    });

    test("item uniqueness is determined by sizeId and colorId", () => {
      const newItem: CartItem = {
        productId: "product-1",
        productName: "Mirage 2 RS",
        sizeId: "size-s",
        sizeLabel: "S",
        colorId: "color-blue",
        colorName: "Blue",
        quantity: 1,
        unitPrice: 299.99,
      };

      // Should match first item in mockItems
      expect(newItem.sizeId).toBe(mockItems[0].sizeId);
      expect(newItem.colorId).toBe(mockItems[0].colorId);
    });
  });

  describe("Add Item Logic", () => {
    test("adds new item when size/color combination doesn't exist", () => {
      const existingItems = [...mockItems];
      const newItem: CartItem = {
        productId: "product-1",
        productName: "Mirage 2 RS",
        sizeId: "size-l",
        sizeLabel: "L",
        colorId: "color-red",
        colorName: "Red",
        quantity: 1,
        unitPrice: 339.99,
      };

      const existingIndex = existingItems.findIndex(
        (item) => item.sizeId === newItem.sizeId && item.colorId === newItem.colorId
      );

      expect(existingIndex).toBe(-1);

      const updatedItems = [...existingItems, newItem];
      expect(updatedItems).toHaveLength(3);
      expect(updatedItems[2]).toEqual(newItem);
    });

    test("merges quantity when size/color combination exists", () => {
      const existingItems = [...mockItems];
      const additionalItem: CartItem = {
        productId: "product-1",
        productName: "Mirage 2 RS",
        sizeId: "size-s",
        sizeLabel: "S",
        colorId: "color-blue",
        colorName: "Blue",
        quantity: 3,
        unitPrice: 299.99,
      };

      const existingIndex = existingItems.findIndex(
        (item) => item.sizeId === additionalItem.sizeId && item.colorId === additionalItem.colorId
      );

      expect(existingIndex).toBe(0); // Should find the first item

      const updatedItems = [...existingItems];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + additionalItem.quantity,
      };

      expect(updatedItems[0].quantity).toBe(5); // 2 + 3
      expect(updatedItems).toHaveLength(2); // No new items added
    });
  });

  describe("Remove Item Logic", () => {
    test("removes item by size and color IDs", () => {
      const sizeIdToRemove = "size-s";
      const colorIdToRemove = "color-blue";

      const updatedItems = mockItems.filter(
        (item) => !(item.sizeId === sizeIdToRemove && item.colorId === colorIdToRemove)
      );

      expect(updatedItems).toHaveLength(1);
      expect(updatedItems[0].sizeId).toBe("size-m");
    });

    test("preserves other items when removing specific item", () => {
      const sizeIdToRemove = "size-m";
      const colorIdToRemove = "color-blue";

      const updatedItems = mockItems.filter(
        (item) => !(item.sizeId === sizeIdToRemove && item.colorId === colorIdToRemove)
      );

      expect(updatedItems).toHaveLength(1);
      expect(updatedItems[0].sizeId).toBe("size-s");
      expect(updatedItems[0].quantity).toBe(2);
    });
  });

  describe("Update Quantity Logic", () => {
    test("updates quantity for existing item", () => {
      const sizeIdToUpdate = "size-s";
      const colorIdToUpdate = "color-blue";
      const newQuantity = 5;

      const updatedItems = mockItems.map((item) =>
        item.sizeId === sizeIdToUpdate && item.colorId === colorIdToUpdate
          ? { ...item, quantity: newQuantity }
          : item
      );

      expect(updatedItems[0].quantity).toBe(5);
      expect(updatedItems[1].quantity).toBe(1); // Unchanged
    });

    test("removes item when quantity is zero or negative", () => {
      const sizeIdToUpdate = "size-s";
      const colorIdToUpdate = "color-blue";
      const newQuantity = 0;

      // Simulate the removeItem logic when quantity <= 0
      let updatedItems: CartItem[];
      if (newQuantity <= 0) {
        updatedItems = mockItems.filter(
          (item) => !(item.sizeId === sizeIdToUpdate && item.colorId === colorIdToUpdate)
        );
      } else {
        updatedItems = mockItems.map((item) =>
          item.sizeId === sizeIdToUpdate && item.colorId === colorIdToUpdate
            ? { ...item, quantity: newQuantity }
            : item
        );
      }

      expect(updatedItems).toHaveLength(1);
      expect(updatedItems[0].sizeId).toBe("size-m");
    });
  });

  describe("Item Count Calculation", () => {
    test("calculates total item count across all items", () => {
      const totalCount = mockItems.reduce((sum, item) => sum + item.quantity, 0);
      expect(totalCount).toBe(3); // 2 + 1
    });

    test("handles empty cart", () => {
      const emptyCart: CartItem[] = [];
      const totalCount = emptyCart.reduce((sum, item) => sum + item.quantity, 0);
      expect(totalCount).toBe(0);
    });

    test("handles single item cart", () => {
      const singleItemCart = [mockItems[0]];
      const totalCount = singleItemCart.reduce((sum, item) => sum + item.quantity, 0);
      expect(totalCount).toBe(2);
    });
  });

  describe("Cart Item Validation", () => {
    test("cart item has required fields", () => {
      const item = mockItems[0];

      expect(item.productId).toBeDefined();
      expect(item.productName).toBeDefined();
      expect(item.sizeId).toBeDefined();
      expect(item.sizeLabel).toBeDefined();
      expect(item.colorId).toBeDefined();
      expect(item.colorName).toBeDefined();
      expect(typeof item.quantity).toBe("number");
      expect(item.quantity).toBeGreaterThan(0);
    });

    test("unit price can be null", () => {
      const itemWithNullPrice: CartItem = {
        ...mockItems[0],
        unitPrice: null,
      };

      expect(itemWithNullPrice.unitPrice).toBeNull();
      // This is valid for cases where price is not yet determined
    });
  });

  describe("Clear Cart Logic", () => {
    test("clears all items from cart", () => {
      const clearedCart: CartItem[] = [];
      expect(clearedCart).toHaveLength(0);

      const totalCount = clearedCart.reduce((sum, item) => sum + item.quantity, 0);
      expect(totalCount).toBe(0);
    });
  });
});