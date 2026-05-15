"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { searchUsers, type SearchResult } from "@/app/actions/search";

export function SearchForm() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus al cargar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounce la búsqueda — esperá 250ms tras la última tecla
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const found = await searchUsers(trimmed);
        setResults(found);
        setHasSearched(true);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o @usuario…"
          className="h-12 w-full rounded-full border border-border bg-transparent pl-12 pr-5 text-base placeholder:text-muted/70 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          autoComplete="off"
        />
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
          <SearchIcon />
        </span>
      </div>

      {query.trim().length > 0 && query.trim().length < 2 && (
        <p className="text-sm text-muted">Escribe al menos 2 caracteres.</p>
      )}

      {isPending && query.trim().length >= 2 && (
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
          Buscando…
        </p>
      )}

      {!isPending && hasSearched && results.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border px-6 py-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Sin resultados
          </p>
          <p className="mt-3 text-sm text-muted">
            No encontramos a nadie con ese nombre o usuario.
          </p>
        </div>
      )}

      {results.length > 0 && (
        <ul className="flex flex-col gap-3">
          {results.map((user) => (
            <li key={user.id}>
              <Link
                href={`/u/${user.username}`}
                className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 transition-colors hover:bg-muted-soft"
              >
                <Avatar
                  username={user.username}
                  fullName={user.full_name}
                  avatarUrl={user.avatar_url}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">
                    {user.full_name ?? user.username}
                  </p>
                  <p className="truncate font-mono text-xs text-muted">
                    @{user.username}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
