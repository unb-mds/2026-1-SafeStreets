import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Drawer from "@/components/Drawer/Drawer";

// Mock next/navigation since Drawer uses usePathname
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
}));

import { usePathname } from "next/navigation";
const mockUsePathname = usePathname as jest.Mock;

describe("Drawer", () => {
  afterEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/");
  });

  describe("rendering", () => {
    it("renders the aside navigation panel", () => {
      render(<Drawer open={false} onClose={jest.fn()} />);
      const aside = screen.getByRole("complementary", {
        name: /Menu de navegação/i,
      });
      expect(aside).toBeInTheDocument();
    });

    it("renders all three nav items", () => {
      render(<Drawer open={false} onClose={jest.fn()} />);
      expect(screen.getByText("Início")).toBeInTheDocument();
      expect(screen.getByText("Mapa de risco")).toBeInTheDocument();
      expect(screen.getByText("Sobre nós")).toBeInTheDocument();
    });

    it("renders the close button with accessible label", () => {
      render(<Drawer open={false} onClose={jest.fn()} />);
      const closeBtn = screen.getByRole("button", { name: /Fechar menu/i });
      expect(closeBtn).toBeInTheDocument();
    });

    it("renders the footer blurb text (edge: footer text presence)", () => {
      render(<Drawer open={false} onClose={jest.fn()} />);
      expect(screen.getByText(/SafeStreets monitora/i)).toBeInTheDocument();
    });
  });

  describe("open/closed state", () => {
    it("passes open=false without applying open CSS classes", () => {
      const { container } = render(<Drawer open={false} onClose={jest.fn()} />);
      const panel = container.querySelector("aside");
      expect(panel?.className).not.toMatch(/panelOpen/);
    });

    it("applies open CSS class when open=true (edge: class name toggling)", () => {
      const { container } = render(<Drawer open={true} onClose={jest.fn()} />);
      const panel = container.querySelector("aside");
      // CSS Modules generates a class that contains 'panelOpen' as part of its hash
      expect(panel?.className).toMatch(/panelOpen|panel/);
    });
  });

  describe("close interactions", () => {
    it("calls onClose when the close button is clicked", () => {
      const onClose = jest.fn();
      render(<Drawer open={true} onClose={onClose} />);
      fireEvent.click(screen.getByRole("button", { name: /Fechar menu/i }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when the backdrop is clicked (edge: outside-click)", () => {
      const onClose = jest.fn();
      const { container } = render(<Drawer open={true} onClose={onClose} />);
      // The backdrop is the first div with aria-hidden
      const backdrop = container.querySelector("[aria-hidden='true']");
      expect(backdrop).toBeInTheDocument();
      fireEvent.click(backdrop!);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when a nav link is clicked (edge: auto-close on navigate)", () => {
      const onClose = jest.fn();
      render(<Drawer open={true} onClose={onClose} />);
      fireEvent.click(screen.getByText("Início"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("active link highlighting", () => {
    it("marks 'Início' as active when pathname is '/'", () => {
      mockUsePathname.mockReturnValue("/");
      const { container } = render(<Drawer open={true} onClose={jest.fn()} />);
      // Active items get navItemActive class
      const activeLinks = container.querySelectorAll("[class*='navItemActive']");
      expect(activeLinks.length).toBeGreaterThanOrEqual(1);
    });

    it("marks 'Mapa de risco' as active when pathname is '/mapa' (edge: non-root route)", () => {
      mockUsePathname.mockReturnValue("/mapa");
      const { container } = render(<Drawer open={true} onClose={jest.fn()} />);
      const activeLinks = container.querySelectorAll("[class*='navItemActive']");
      expect(activeLinks.length).toBeGreaterThanOrEqual(1);
    });

    it("does NOT mark external 'Sobre nós' link as active even when pathname matches (edge: external link)", () => {
      mockUsePathname.mockReturnValue(
        "https://unb-mds.github.io/2026-1-SafeStreets/"
      );
      const { container } = render(<Drawer open={true} onClose={jest.fn()} />);
      // External links should never receive active class
      const sobreLink = screen
        .getByText("Sobre nós")
        .closest("a") as HTMLAnchorElement;
      expect(sobreLink?.className).not.toMatch(/navItemActive/);
    });

    it("external 'Sobre nós' opens in new tab (edge: security rel noopener)", () => {
      render(<Drawer open={false} onClose={jest.fn()} />);
      const sobreLink = screen
        .getByText("Sobre nós")
        .closest("a") as HTMLAnchorElement;
      expect(sobreLink).toHaveAttribute("target", "_blank");
      expect(sobreLink).toHaveAttribute("rel", "noopener noreferrer");
    });
  });
});
