'use client';

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoadingState() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-5 w-[150px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-[180px]" />
            </div>
            <div className="border rounded-md">
              <div className="space-y-3 p-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <Skeleton className="h-4 w-[30%]" />
                    <Skeleton className="h-4 w-[20%]" />
                    <Skeleton className="h-4 w-[20%]" />
                    <Skeleton className="h-4 w-[15%]" />
                    <Skeleton className="h-4 w-[15%]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}