import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Chrome from "@/components/Chrome/Chrome";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/"),
}));

describe("Chrome", () => {
  describe("rendering", () => {
    it("renders children inside a main element", () => {
      render(
        <Chrome>
          <p>Conteúdo filho</p>
        </Chrome>
      );
      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();
      expect(main).toHaveTextContent("Conteúdo filho");
    });

    it("renders the Header with menu button", () => {
      render(<Chrome><span /></Chrome>);
      expect(
        screen.getByRole("button", { name: /Abrir menu/i })
      ).toBeInTheDocument();
    });

    it("renders the Footer", () => {
      render(<Chrome><span /></Chrome>);
      expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    it("renders the Drawer panel", () => {
      render(<Chrome><span /></Chrome>);
      expect(
        screen.getByRole("complementary", { name: /Menu de navegação/i })
      ).toBeInTheDocument();
    });
  });

  describe("drawer state management", () => {
    it("drawer starts closed by default", () => {
      const { container } = render(<Chrome><span /></Chrome>);
      const panel = container.querySelector("aside");
      expect(panel?.className).not.toMatch(/panelOpen/);
    });

    it("opens the drawer when the menu button is clicked", () => {
      const { container } = render(<Chrome><span /></Chrome>);
      fireEvent.click(screen.getByRole("button", { name: /Abrir menu/i }));
      const panel = container.querySelector("aside");
      // Panel should now have the open class applied
      expect(panel?.className).toMatch(/panel/);
    });

    it("closes the drawer when the close button is clicked (edge: toggle off)", () => {
      const { container } = render(<Chrome><span /></Chrome>);
      // Open it
      fireEvent.click(screen.getByRole("button", { name: /Abrir menu/i }));
      // Close it
      fireEvent.click(screen.getByRole("button", { name: /Fechar menu/i }));
      const panel = container.querySelector("aside");
      expect(panel?.className).not.toMatch(/panelOpen/);
    });

    it("can open and close the drawer multiple times (edge: repeated toggling)", () => {
      render(<Chrome><span /></Chrome>);
      const menuBtn = screen.getByRole("button", { name: /Abrir menu/i });
      expect(() => {
        fireEvent.click(menuBtn);
        fireEvent.click(screen.getByRole("button", { name: /Fechar menu/i }));
        fireEvent.click(menuBtn);
        fireEvent.click(screen.getByRole("button", { name: /Fechar menu/i }));
      }).not.toThrow();
    });
  });

  describe("edge cases", () => {
    it("renders with null as children without crashing (edge: no children)", () => {
      expect(() => render(<Chrome>{null}</Chrome>)).not.toThrow();
    });

    it("renders with multiple children (edge: fragment children)", () => {
      render(
        <Chrome>
          <p>Filho 1</p>
          <p>Filho 2</p>
        </Chrome>
      );
      expect(screen.getByText("Filho 1")).toBeInTheDocument();
      expect(screen.getByText("Filho 2")).toBeInTheDocument();
    });
  });
});
