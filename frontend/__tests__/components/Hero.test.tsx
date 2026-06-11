import React from "react";
import { render, screen } from "@testing-library/react";
import Hero from "@/components/Hero/Hero";

describe("Hero", () => {
  describe("rendering", () => {
    it("renders the section element", () => {
      const { container } = render(<Hero />);
      const section = container.querySelector("section");
      expect(section).toBeInTheDocument();
    });

    it("displays the main h1 title", () => {
      render(<Hero />);
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading.textContent).toMatch(/segura/i);
    });

    it("displays the subtitle paragraph", () => {
      render(<Hero />);
      expect(screen.getByText(/Região Administrativa/i)).toBeInTheDocument();
    });

    it("renders the eyebrow region tag (DF)", () => {
      render(<Hero />);
      expect(screen.getByText(/DF/)).toBeInTheDocument();
    });
  });

  describe("content integrity", () => {
    it("shows safety/real-time messaging in the eyebrow (edge: brand copy check)", () => {
      render(<Hero />);
      expect(screen.getByText(/SEGURANÇA EM TEMPO REAL/i)).toBeInTheDocument();
    });

    it("renders the PinIcon SVG inside the section (edge: icon present)", () => {
      const { container } = render(<Hero />);
      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });

    it("renders only one h1 (edge: duplicate heading)", () => {
      render(<Hero />);
      const headings = screen.getAllByRole("heading", { level: 1 });
      expect(headings).toHaveLength(1);
    });

    it("title contains 'transparente' (edge: exact brand wording)", () => {
      render(<Hero />);
      expect(screen.getByText(/transparente/i)).toBeInTheDocument();
    });
  });
});
