"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@orgatick/ui/components/avatar";
import { Badge } from "@orgatick/ui/components/badge";
import { Button } from "@orgatick/ui/components/button";
import { Input } from "@orgatick/ui/components/input";
import { IconCheck, IconMail, IconReload, IconSearch, IconUser, IconUserCheck, IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import type { OrganizationCandidateUserResponse } from "@orgatick/contracts";
import { searchCandidateUsers } from "@/lib/apis/organization.api";

interface MemberUserAutocompleteProps {
  value: string;
  onChange: (email: string) => void;
  onSwitchToInvite?: (suggestedEmail?: string) => void;
  hasError?: boolean;
}

export function MemberUserAutocomplete({ value, onChange, onSwitchToInvite, hasError }: MemberUserAutocompleteProps) {
  const [query, setQuery] = useState(value || "");
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<OrganizationCandidateUserResponse[]>([]);
  const [selectedUser, setSelectedUser] = useState<OrganizationCandidateUserResponse | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external form value changes (e.g. form.reset)
  useEffect(() => {
    if (!value) {
      setSelectedUser(null);
      setQuery("");
    } else if (selectedUser && selectedUser.email !== value) {
      setSelectedUser(null);
      setQuery(value);
    }
  }, [value, selectedUser]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadCandidates = async (searchQuery: string) => {
    setLoading(true);
    try {
      const results = await searchCandidateUsers({
        q: searchQuery.trim() || undefined,
        limit: 10,
      });
      setCandidates(results);
      // If a candidate matches current selected email exactly, set as selectedUser
      if (value && !selectedUser) {
        const found = results.find((c) => c.email.toLowerCase() === value.toLowerCase());
        if (found) setSelectedUser(found);
      }
    } catch {
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (val: string) => {
    setQuery(val);
    onChange(val);
    if (selectedUser && selectedUser.email !== val) {
      setSelectedUser(null);
    }
    if (!open) setOpen(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadCandidates(val);
    }, 200);
  };

  const handleFocus = () => {
    setOpen(true);
    if (candidates.length === 0) {
      loadCandidates(query);
    }
  };

  const handleSelect = (candidate: OrganizationCandidateUserResponse) => {
    if (candidate.isMember) return;
    setSelectedUser(candidate);
    setQuery(candidate.email);
    onChange(candidate.email);
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedUser(null);
    setQuery("");
    onChange("");
    setOpen(false);
  };

  // If a specific user candidate is selected and matches value
  if (selectedUser && selectedUser.email === value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="size-9 shrink-0 ring-1 ring-border">
            {selectedUser.avatar && <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />}
            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
              {selectedUser.name ? selectedUser.name.slice(0, 2).toUpperCase() : <IconUser className="size-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-semibold text-foreground">{selectedUser.name || "Registered User"}</p>
              <IconCheck className="size-3.5 text-primary shrink-0" />
            </div>
            <p className="truncate font-mono text-[11px] text-muted-foreground">{selectedUser.email}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleClear}
          className="shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Change user"
        >
          <IconX className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative space-y-1">
      <div className="relative">
        <IconSearch className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="member-email"
          type="email"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Search by registered user name or email..."
          className="ps-8 pe-8 text-xs h-9"
          autoComplete="off"
          aria-invalid={hasError}
        />
        {loading ? (
          <IconReload className="absolute end-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
            aria-label="Clear input"
          >
            <IconX className="size-3.5" />
          </button>
        ) : null}
      </div>

      {open && (
        <div className="absolute top-full start-0 z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-border/80 bg-popover p-1 shadow-md ring-1 ring-foreground/10 text-popover-foreground">
          {loading && candidates.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
              <IconReload className="size-3.5 animate-spin" />
              <span>Searching registered users…</span>
            </div>
          ) : candidates.length === 0 ? (
            <div className="p-3 text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                {query.trim() ? `No registered user found matching "${query}".` : "No registered users found."}
              </p>
              {onSwitchToInvite && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 text-xs"
                  onClick={() => {
                    setOpen(false);
                    onSwitchToInvite(query.trim());
                  }}
                >
                  <IconMail className="size-3.5" />
                  Invite via email instead
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Registered Users
              </div>
              {candidates.map((candidate) => {
                const isCurrentMember = candidate.isMember;
                return (
                  <button
                    key={candidate.id}
                    type="button"
                    disabled={isCurrentMember}
                    onClick={() => handleSelect(candidate)}
                    className={`flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors outline-none ${
                      isCurrentMember
                        ? "opacity-50 cursor-not-allowed bg-muted/40"
                        : "hover:bg-muted/80 focus:bg-muted/80 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="size-7 shrink-0 ring-1 ring-border">
                        {candidate.avatar && <AvatarImage src={candidate.avatar} alt={candidate.name} />}
                        <AvatarFallback className="text-[10px] font-medium bg-muted text-muted-foreground">
                          {candidate.name ? (
                            candidate.name.slice(0, 2).toUpperCase()
                          ) : (
                            <IconUser className="size-3.5" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{candidate.name || candidate.email}</p>
                        <p className="truncate font-mono text-[10px] text-muted-foreground">{candidate.email}</p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isCurrentMember ? (
                        <Badge variant="outline" className="text-[9px] gap-1 font-normal text-muted-foreground">
                          <IconUserCheck className="size-2.5" />
                          Member
                        </Badge>
                      ) : candidate.isInvited ? (
                        <Badge variant="outline" className="text-[9px] gap-1 font-normal text-warning">
                          <IconMail className="size-2.5" />
                          Invited
                        </Badge>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
