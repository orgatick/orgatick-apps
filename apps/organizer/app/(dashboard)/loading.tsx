import { Skeleton } from "@orgatick/ui/components/skeleton";
import { Card, CardContent, CardHeader } from "@orgatick/ui/components/card";

export default function DashboardLoading() {
  return (
    <div className="flex w-full flex-col gap-6 max-w-6xl mx-auto pb-10 animate-in fade-in-50 duration-200">
      {/* Page Header Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-28 rounded-full" />
          <Skeleton className="h-8 w-60 rounded-lg sm:w-72" />
          <Skeleton className="h-4 w-80 rounded-md sm:w-96" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-24 rounded-full" />
                <Skeleton className="size-7 rounded-lg" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5">
              <Skeleton className="h-7 w-20 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Card Skeleton */}
      <Card className="border-border/60">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-28 rounded-lg" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-44 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-3">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex items-center justify-between rounded-lg border border-border/30 p-3.5">
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 rounded-md" />
                  <Skeleton className="h-3 w-48 rounded-full" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
