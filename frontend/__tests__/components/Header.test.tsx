import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "@/components/Header/Header";

// next/link and next/image are handled by next/jest transformer
// next/navigation is not used in Header directly

describe("Header", () => {
  describe("rendering", () => {
    it("renders a header element", () => {
      render(<Header onMenuClick={jest.fn()} />);
      const header = screen.getByRole("banner");
      expect(header).toBeInTheDocument();
    });

    it("renders the menu button with accessible label", () => {
      render(<Header onMenuClick={jest.fn()} />);
      const btn = screen.getByRole("button", { name: /Abrir menu/i });
      expect(btn).toBeInTheDocument();
    });

    it("renders the logo link pointing to home", () => {
      render(<Header onMenuClick={jest.fn()} />);
      const logoLink = screen.getByRole("link", { name: /SafeStreets/i });
      expect(logoLink).toHaveAttribute("href", "/");
    });

    it("renders the visual search placeholder text", () => {
      render(<Header onMenuClick={jest.fn()} />);
      expect(screen.getByText(/Buscar por região/i)).toBeInTheDocument();
    });
  });

  describe("interactions", () => {
    it("calls onMenuClick when the menu button is clicked", () => {
      const onMenuClick = jest.fn();
      render(<Header onMenuClick={onMenuClick} />);
      fireEvent.click(screen.getByRole("button", { name: /Abrir menu/i }));
      expect(onMenuClick).toHaveBeenCalledTimes(1);
    });

    it("calls onMenuClick each time the button is clicked (edge: multiple clicks)", () => {
      const onMenuClick = jest.fn();
      render(<Header onMenuClick={onMenuClick} />);
      const btn = screen.getByRole("button", { name: /Abrir menu/i });
      fireEvent.click(btn);
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(onMenuClick).toHaveBeenCalledTimes(3);
    });

    it("does not throw when onMenuClick is a no-op (edge: empty handler)", () => {
      render(<Header onMenuClick={() => {}} />);
      expect(() =>
        fireEvent.click(screen.getByRole("button", { name: /Abrir menu/i }))
      ).not.toThrow();
    });
  });
});
