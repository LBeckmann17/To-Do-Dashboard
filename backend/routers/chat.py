import os
from typing import Any

import anthropic
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/chat", tags=["chat"])

_client: anthropic.Anthropic | None = None


def _get_client() -> anthropic.Anthropic:
    global _client
    if _client is None:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY not configured")
        _client = anthropic.Anthropic(api_key=api_key)
    return _client


SYSTEM = (
    "Du bist ein persönlicher Aufgaben-Assistent für ein To-Do Dashboard (Tasker). "
    "Du hilfst dem Nutzer dabei, Aufgaben zu priorisieren, den Tag zu planen und Aufgaben zu strukturieren. "
    "Antworte auf Deutsch, knapp und hilfreich. Verwende Markdown wenn passend (fett, Listen). "
    "Kenne die vier Listen: Arbeit (blau), Privat (lila), Putzen (grün), Einkauf (orange)."
)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    context: dict[str, Any] = {}


class ChatResponse(BaseModel):
    reply: str


def _build_system(context: dict[str, Any]) -> str:
    tasks = context.get("tasks", [])
    shopping = context.get("shopping", [])
    if not tasks and not shopping:
        return SYSTEM

    lines = [SYSTEM, "\n\n## Aktueller Kontext"]
    if tasks:
        lines.append("### Offene Aufgaben")
        for t in tasks[:25]:
            deadline = f" (bis {t['deadline'][:10]})" if t.get("deadline") else ""
            lines.append(f"- [{t.get('list_type','')}/{t.get('priority','')}] {t.get('title','')}{deadline}")
    if shopping:
        lines.append("### Einkaufsliste")
        for s in shopping[:20]:
            lines.append(f"- {s.get('name','')} ({s.get('category','')})")
    return "\n".join(lines)


@router.post("", response_model=ChatResponse)
def chat(body: ChatRequest) -> ChatResponse:
    client = _get_client()

    messages = [{"role": m.role, "content": m.content} for m in body.history]
    messages.append({"role": "user", "content": body.message})

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=_build_system(body.context),
        messages=messages,
    )

    reply = response.content[0].text if response.content else ""
    return ChatResponse(reply=reply)
