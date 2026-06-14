import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchProvider, useSearch } from "@/components/SearchProvider/SearchProvider";

// Componente de sonda que expõe o valor do contexto e um botão para alterá-lo.
function Probe() {
  const { query, setQuery } = useSearch();
  return (
    <div>
      <span data-testid="query">{query}</span>
      <button onClick={() => setQuery("nova busca")}>set</button>
    </div>
  );
}

describe("SearchProvider / useSearch", () => {
  describe("happy path", () => {
    it("inicia com query vazia e atualiza ao chamar setQuery", () => {
      render(
        <SearchProvider>
          <Probe />
        </SearchProvider>
      );
      expect(screen.getByTestId("query")).toHaveTextContent("");
      fireEvent.click(screen.getByRole("button", { name: "set" }));
      expect(screen.getByTestId("query")).toHaveTextContent("nova busca");
    });
  });

  describe("edge cases", () => {
    it("fornece valores padrão seguros fora do provider (query vazia, setQuery no-op)", () => {
      render(<Probe />);
      expect(screen.getByTestId("query")).toHaveTextContent("");
      // setQuery padrão é no-op: clicar não deve lançar nem alterar o valor
      expect(() =>
        fireEvent.click(screen.getByRole("button", { name: "set" }))
      ).not.toThrow();
      expect(screen.getByTestId("query")).toHaveTextContent("");
    });
  });
});
