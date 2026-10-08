"use client";

import type { NewsletterListResponse } from "@orgatick/contracts";
import { Button } from "@orgatick/ui/components/button";
import { Card, CardContent } from "@orgatick/ui/components/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@orgatick/ui/components/empty";
import { Input } from "@orgatick/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@orgatick/ui/components/select";
import { IconFilter, IconInbox, IconPlus, IconSearch, IconUsers } from "@tabler/icons-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ListStatusBadge } from "../status-badge";
import { ListRowActionsMenu } from "./list-row-actions-menu";
import { LinkButton } from "@/components/ui/link-button";

interface ListsTableProps {
  lists: NewsletterListResponse[];
  onEdit: (list: NewsletterListResponse) => void;
  onDelete: (list: NewsletterListResponse) => void;
  onAddSubscriber: (list: NewsletterListResponse) => void;
  onCreateNew: () => void;
}

export function ListsTable({ lists, onEdit, onDelete, onAddSubscriber, onCreateNew }: ListsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("subscribers");

  const filteredLists = useMemo(() => {
    return lists
      .filter((list) => {
        if (statusFilter === "active" && !list.isActive) return false;
        if (statusFilter === "paused" && list.isActive) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = list.name.toLowerCase().includes(q);
          const matchSlug = list.slug.toLowerCase().includes(q);
          const matchDesc = (list.description || "").toLowerCase().includes(q);
          if (!matchName && !matchSlug && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "subscribers") return (b.subscriberCount || 0) - (a.subscriberCount || 0);
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0;
      });
  }, [lists, search, statusFilter, sortBy]);

  if (lists.length === 0) {
    return (
      <Card className="ring-1 ring-foreground/10">
        <CardContent className="p-12">
          <Empty>
            <EmptyMedia variant="icon">
              <IconInbox className="size-5" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No mailing lists yet</EmptyTitle>
              <EmptyDescription>
                Create your first mailing list to start organizing subscribers and targeting email campaigns.
              </EmptyDescription>
            </EmptyHeader>
            <Button size="sm" onClick={onCreateNew} className="gap-1.5 mt-2">
              <IconPlus className="size-4" />
              Create First List
            </Button>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, slug or description..."
            className="ps-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? "all")}>
            <SelectTrigger className="h-9 w-32 text-xs">
              <IconFilter className="size-3.5 me-1.5 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active only</SelectItem>
              <SelectItem value="paused">Paused only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(val) => setSortBy(val ?? "subscribers")}>
            <SelectTrigger className="h-9 w-36 text-xs">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="subscribers">Most subscribers</SelectItem>
              <SelectItem value="name">Alphabetical</SelectItem>
              <SelectItem value="newest">Recently created</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="ring-1 ring-foreground/10 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Mailing List</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Scope</th>
                  <th className="px-4 py-3 text-right font-medium">Subscribers</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLists.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8">
                      <Empty>
                        <EmptyHeader>
                          <EmptyTitle className="text-sm">No lists found</EmptyTitle>
                          <EmptyDescription className="text-xs">
                            No mailing lists match your search query or filter.
                          </EmptyDescription>
                        </EmptyHeader>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearch("");
                            setStatusFilter("all");
                          }}
                        >
                          Clear filters
                        </Button>
                      </Empty>
                    </td>
                  </tr>
                ) : (
                  filteredLists.map((list) => (
                    <tr
                      key={list.id}
                      className="border-b border-border/60 last:border-b-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">{list.name}</p>
                          <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            /{list.slug}
                          </span>
                        </div>
                        {list.description ? (
                          <p className="truncate text-xs text-muted-foreground mt-0.5">{list.description}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground/60 italic mt-0.5">No description provided</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <ListStatusBadge isActive={list.isActive} isDefault={list.isDefault} />
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs capitalize text-muted-foreground">{list.scope}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <Link
                          href={`/subscribers?listId=${list.id}`}
                          className="inline-flex items-center gap-1 font-mono text-xs tabular-nums text-foreground hover:text-primary transition-colors font-medium"
                          title="Click to view subscribers"
                        >
                          <IconUsers className="size-3.5 text-muted-foreground" />
                          {(list.subscriberCount || 0).toLocaleString()}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-xs text-muted-foreground">
                          {new Date(list.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <LinkButton
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-xs"
                            href={`/subscribers?listId=${list.id}`}
                          >
                            View
                          </LinkButton>
                          <ListRowActionsMenu
                            list={list}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onAddSubscriber={onAddSubscriber}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
