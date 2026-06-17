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

    it("renders a search input with an accessible name and placeholder", () => {
      render(<Header onMenuClick={jest.fn()} />);
      const input = screen.getByRole("searchbox", { name: /Buscar notícias/i });
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("placeholder", expect.stringMatching(/Buscar por região/i));
    });

    it("reflects the searchQuery prop as the input value", () => {
      render(<Header onMenuClick={jest.fn()} searchQuery="Ceilândia" />);
      expect(screen.getByRole("searchbox")).toHaveValue("Ceilândia");
    });
  });

  describe("overlay variant (rota /mapa)", () => {
    it("does not render the search box", () => {
      render(<Header onMenuClick={jest.fn()} overlay />);
      expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    });

    it("still renders the menu button and logo", () => {
      render(<Header onMenuClick={jest.fn()} overlay />);
      expect(screen.getByRole("button", { name: /Abrir menu/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /SafeStreets/i })).toBeInTheDocument();
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

    it("calls onSearchChange with the typed value when the user types", () => {
      const onSearchChange = jest.fn();
      render(<Header onMenuClick={jest.fn()} onSearchChange={onSearchChange} />);
      fireEvent.change(screen.getByRole("searchbox"), {
        target: { value: "furtos" },
      });
      expect(onSearchChange).toHaveBeenCalledWith("furtos");
    });

    it("does not throw when typing without an onSearchChange handler (edge: missing handler)", () => {
      render(<Header onMenuClick={jest.fn()} />);
      expect(() =>
        fireEvent.change(screen.getByRole("searchbox"), {
          target: { value: "x" },
        })
      ).not.toThrow();
    });
  });
});
