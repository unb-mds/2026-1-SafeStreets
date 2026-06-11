import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer/Footer";

describe("Footer", () => {
  describe("rendering", () => {
    it("renders the footer element", () => {
      render(<Footer />);
      const footer = screen.getByRole("contentinfo");
      expect(footer).toBeInTheDocument();
    });

    it("displays the SafeStreets brand name", () => {
      render(<Footer />);
      expect(screen.getByText(/SafeStreets/)).toBeInTheDocument();
    });

    it("includes the current year in the copyright text", () => {
      render(<Footer />);
      const currentYear = new Date().getFullYear().toString();
      expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    it("displays the copyright symbol ©", () => {
      render(<Footer />);
      expect(screen.getByText(/©/)).toBeInTheDocument();
    });

    it("mentions DF (Distrito Federal) in the text (edge: content integrity)", () => {
      render(<Footer />);
      expect(screen.getByText(/DF/)).toBeInTheDocument();
    });

    it("renders only one footer element (edge: duplicate footer)", () => {
      const { container } = render(<Footer />);
      const footers = container.querySelectorAll("footer");
      expect(footers).toHaveLength(1);
    });

    it("renders consistently across multiple mounts (edge: idempotency)", () => {
      const year = new Date().getFullYear().toString();

      const { container: c1, unmount: unmount1 } = render(<Footer />);
      expect(c1.querySelector("footer")).toBeInTheDocument();
      expect(c1.textContent).toContain(year);
      unmount1();

      const { container: c2 } = render(<Footer />);
      expect(c2.querySelector("footer")).toBeInTheDocument();
      expect(c2.textContent).toContain(year);
    });
  });
});
