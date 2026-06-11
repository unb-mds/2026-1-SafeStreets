import React from "react";
import { render, screen } from "@testing-library/react";
import {
  MenuIcon,
  SearchIcon,
  CloseIcon,
  HomeIcon,
  MapIcon,
  InfoIcon,
  PinIcon,
  ArrowRightIcon,
} from "@/components/icons";

const ICONS = [
  { name: "MenuIcon", Component: MenuIcon },
  { name: "SearchIcon", Component: SearchIcon },
  { name: "CloseIcon", Component: CloseIcon },
  { name: "HomeIcon", Component: HomeIcon },
  { name: "MapIcon", Component: MapIcon },
  { name: "InfoIcon", Component: InfoIcon },
  { name: "PinIcon", Component: PinIcon },
  { name: "ArrowRightIcon", Component: ArrowRightIcon },
];

describe("Icon components", () => {
  ICONS.forEach(({ name, Component }) => {
    describe(name, () => {
      it("renders an SVG with default props", () => {
        const { container } = render(<Component />);
        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
      });

      it("applies custom size prop to width and height", () => {
        const { container } = render(<Component size={48} />);
        const svg = container.querySelector("svg");
        expect(svg).toHaveAttribute("width", "48");
        expect(svg).toHaveAttribute("height", "48");
      });

      it("applies custom color prop to stroke (edge: non-standard color string)", () => {
        const { container } = render(<Component color="rgb(255, 0, 128)" />);
        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
        // Verifica que o SVG foi renderizado com a cor customizada (não explode)
        const paths = container.querySelectorAll("path, circle");
        paths.forEach((el) => {
          const stroke = el.getAttribute("stroke");
          if (stroke) {
            expect(stroke).toBe("rgb(255, 0, 128)");
          }
        });
      });

      it("renders with size=0 without throwing (edge: zero size)", () => {
        expect(() => render(<Component size={0} />)).not.toThrow();
        const { container } = render(<Component size={0} />);
        const svg = container.querySelector("svg");
        expect(svg).toHaveAttribute("width", "0");
        expect(svg).toHaveAttribute("height", "0");
      });

      it("renders with empty string color without throwing (edge: empty color)", () => {
        expect(() => render(<Component color="" />)).not.toThrow();
      });

      it("applies className prop to the SVG element", () => {
        const { container } = render(<Component className="test-class" />);
        const svg = container.querySelector("svg");
        expect(svg).toHaveClass("test-class");
      });
    });
  });
});
