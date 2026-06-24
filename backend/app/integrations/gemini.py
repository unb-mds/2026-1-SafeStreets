"""Integração com o Google Gemini — resumo de ocorrências por IA.

Camada de integração: isola o Gemini. NÃO toca no banco.

Comportamento de falha segue o **ADR-001 (Opção A)**: quando o Gemini falha
(sem chave, SDK ausente, timeout, quota, input inválido) o sistema NÃO bloqueia
— devolve `resumo=None` com `status="ERRO"`. Não há retry assíncrono nem resumo
genérico (opções B e C foram descartadas pela equipe).

Projeto testável sem chave/SDK/rede:
- o import do `google.genai` é PREGUIÇOSO (só dentro de `_gerar_real`);
- `generate_fn` pode ser injetada para simular o Gemini nos testes.
"""
import os
from dataclasses import dataclass

GEMINI_MODEL = "gemini-3.5-flash"

STATUS_COMPLETO = "COMPLETO"
STATUS_ERRO = "ERRO"

_PROMPT = (
    "Resuma em uma frase, em português, esta notícia de segurança pública "
    "do Distrito Federal: {texto}"
)


@dataclass
class ResumoResult:
    resumo: str | None
    status: str  # "COMPLETO" | "ERRO"


class GeminiClient:
    def __init__(self, api_key: str | None = None, model: str = GEMINI_MODEL, *, generate_fn=None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model = model
        self._generate_fn = generate_fn  # injeção p/ teste: (texto) -> str

    def resumir(self, texto: str | None) -> ResumoResult:
        # Texto vazio: nada a resumir -> ERRO (ADR-001 A).
        if not texto or not texto.strip():
            return ResumoResult(None, STATUS_ERRO)

        gerar = self._generate_fn or self._gerar_real
        # Sem função injetada e sem chave: não dá para chamar o Gemini -> ERRO.
        if self._generate_fn is None and not self.api_key:
            return ResumoResult(None, STATUS_ERRO)

        try:
            resumo = gerar(texto)
        except Exception:  # noqa: BLE001 — qualquer falha vira ERRO (ADR-001 A)
            return ResumoResult(None, STATUS_ERRO)

        if not resumo or not resumo.strip():
            return ResumoResult(None, STATUS_ERRO)
        return ResumoResult(resumo.strip(), STATUS_COMPLETO)

    def _gerar_real(self, texto: str) -> str:
        # Import preguiçoso: o módulo é importável mesmo sem o SDK instalado.
        from google import genai

        client = genai.Client(api_key=self.api_key)
        resp = client.models.generate_content(
            model=self.model,
            contents=_PROMPT.format(texto=texto),
        )
        return resp.text
