"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, PenLine } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

export function LoadingIndicator() {
  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0 mt-1">
        <AvatarFallback className="bg-primary text-primary-foreground">
          <PenLine className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      {/* Loading Content */}
      <div className="flex-1 space-y-3 min-w-0 max-w-[85%]">
        {/* Role Badge */}
        <Badge variant="default" className="text-xs w-fit">
          Economist
        </Badge>

        {/* Skeleton Loading */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            </div>
            <span className="text-sm text-muted-foreground">Thinking...</span>
          </div>

          {/* Multiple skeleton lines to simulate response */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
