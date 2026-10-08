"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@orgatick/ui/components/avatar";
import { Badge } from "@orgatick/ui/components/badge";
import { Button } from "@orgatick/ui/components/button";
import { Input } from "@orgatick/ui/components/input";
import { IconReload, IconSearch, IconUser, IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { fetchUsers } from "@/lib/admin.api";
import { fetchNewsletterSubscribers } from "@/lib/newsletter.api";

export interface AutocompleteCandidate {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  sourceType: "database_user" | "newsletter_subscriber";
}

interface SubscriberAutocompleteProps {
  onSelect: (candidate: { email: string; name: string }) => void;
  selectedEmail?: string;
  selectedName?: string;
  onClear: () => void;
}

export function SubscriberAutocomplete({
  onSelect,
  selectedEmail,
  selectedName,
  onClear,
}: SubscriberAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AutocompleteCandidate[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [usersRes, subsRes] = await Promise.allSettled([
          fetchUsers({ search: query.trim(), limit: 6 }),
          fetchNewsletterSubscribers({ search: query.trim(), limit: 6 }),
        ]);

        const map = new Map<string, AutocompleteCandidate>();

        if (usersRes.status === "fulfilled" && usersRes.value?.items) {
          for (const u of usersRes.value.items) {
            if (u.email) {
              map.set(u.email.toLowerCase(), {
                id: String(u.id),
                name: u.name || "",
                email: u.email,
                avatar: u.avatar,
                sourceType: "database_user",
              });
            }
          }
        }

        if (subsRes.status === "fulfilled" && subsRes.value?.items) {
          for (const s of subsRes.value.items) {
            const lower = s.email.toLowerCase();
            if (!map.has(lower)) {
              map.set(lower, {
                id: s.id,
                name: s.name || "",
                email: s.email,
                sourceType: "newsletter_subscriber",
              });
            }
          }
        }

        setResults(Array.from(map.values()));
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (selectedEmail) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <IconUser className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">{selectedName || "Registered User"}</p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">{selectedEmail}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            onClear();
            setQuery("");
          }}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Remove selection"
        >
          <IconX className="size-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative space-y-1">
      <div className="relative">
        <IconSearch className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setOpen(true);
          }}
          placeholder="Search registered user by name or email..."
          className="ps-8 pe-8 text-xs h-9"
          autoComplete="off"
        />
        {loading && (
          <IconReload className="absolute end-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground animate-spin" />
        )}
      </div>

      {open && query.trim().length >= 2 && (
        <div className="absolute top-full start-0 z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-border/80 bg-popover p-1 shadow-md ring-1 ring-foreground/10 text-popover-foreground">
          {results.length === 0 ? (
            <div className="p-3 text-center text-xs text-muted-foreground">
              {loading ? "Searching database..." : "No users or subscribers found matching query"}
            </div>
          ) : (
            results.map((candidate) => (
              <button
                key={candidate.email}
                type="button"
                onClick={() => {
                  onSelect({ email: candidate.email, name: candidate.name });
                  setOpen(false);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors hover:bg-muted/80 focus:bg-muted/80 outline-none"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="size-6 shrink-0">
                    {candidate.avatar && <AvatarImage src={candidate.avatar} alt={candidate.name} />}
                    <AvatarFallback className="text-[10px] bg-muted">
                      {candidate.name ? candidate.name.slice(0, 2).toUpperCase() : <IconUser className="size-3" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{candidate.name || candidate.email}</p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">{candidate.email}</p>
                  </div>
                </div>

                <Badge variant="outline" className="text-[9px] shrink-0 font-normal">
                  {candidate.sourceType === "database_user" ? "User DB" : "Subscriber"}
                </Badge>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
