import { screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe("Avatar test", () => {
    test("Should show title", () => {
        expect(screen.getByText(/test/i)).toBeDefined();
    });
});
