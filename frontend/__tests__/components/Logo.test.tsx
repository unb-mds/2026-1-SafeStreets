import React from "react";
import { render, screen } from "@testing-library/react";
import Logo from "@/components/Logo/Logo";

describe("Logo", () => {
  describe("rendering", () => {
    it("renders the brand image with alt text", () => {
      render(<Logo />);
      const img = screen.getByAltText("SafeStreets escudo");
      expect(img).toBeInTheDocument();
    });

    it("displays 'Safe' and 'Streets' text spans", () => {
      render(<Logo />);
      expect(screen.getByText("Safe")).toBeInTheDocument();
      expect(screen.getByText("Streets")).toBeInTheDocument();
    });
  });

  describe("size prop", () => {
    it("defaults to size=36 when no prop passed", () => {
      render(<Logo />);
      const img = screen.getByAltText("SafeStreets escudo");
      expect(img).toHaveAttribute("width", "36");
      expect(img).toHaveAttribute("height", "36");
    });

    it("applies a custom size value (edge: large size)", () => {
      render(<Logo size={128} />);
      const img = screen.getByAltText("SafeStreets escudo");
      expect(img).toHaveAttribute("width", "128");
      expect(img).toHaveAttribute("height", "128");
    });

    it("renders with size=1 without throwing (edge: minimum positive value)", () => {
      expect(() => render(<Logo size={1} />)).not.toThrow();
      const img = screen.getByAltText("SafeStreets escudo");
      expect(img).toHaveAttribute("width", "1");
    });

    it("renders with size=0 without throwing (edge: zero size)", () => {
      expect(() => render(<Logo size={0} />)).not.toThrow();
    });
  });

  describe("image source", () => {
    it("points to the escudo image file (edge: wrong src check)", () => {
      render(<Logo />);
      const img = screen.getByAltText("SafeStreets escudo");
      expect(img).toHaveAttribute("src");
      const src = img.getAttribute("src") ?? "";
      expect(src).toMatch(/logo-escudo/);
    });
  });
});
