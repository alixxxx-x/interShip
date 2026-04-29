"use client"

import * as React from "react"
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  logoSrc,
  name,
  subtitle
}) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-3 px-2 py-2">
          {logoSrc && (
            <div className="flex aspect-square size-10 items-center justify-center rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={logoSrc}
                alt={name}
                className="size-full object-cover"
              />
            </div>
          )}
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold text-base">
              {name}
            </span>
            <span className="truncate text-xs text-muted-foreground">{subtitle}</span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
