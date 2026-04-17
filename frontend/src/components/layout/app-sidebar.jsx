"use client"

import * as React from "react"
import { useNavigate } from "react-router-dom"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Building2,
  Users,
  Search,
} from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import { TeamSwitcher } from "@/components/layout/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import api from "@/api/api"
import { ACCESS_TOKEN } from "@/constants"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const data = {
  teams: [
    {
      name: "Inter.Ship",
      logo: GalleryVerticalEnd,
      plan: "Platform Admin",
    },
    {
      name: "Acme Corp",
      logo: Building2,
      plan: "Hiring Partner",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/companydashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/companydashboard",
        },
        {
          title: "Analytics",
          url: "/companydashboard/analytics",
        },
      ],
    },
    {
      title: "Internships",
      url: "/internships",
      icon: SquareTerminal,
      items: [
        {
          title: "Browse All",
          url: "/internships",
        },
        {
          title: "My Listings",
          url: "/companydashboard/listings",
        },
        {
          title: "New Posting",
          url: "/companydashboard/new-internship",
        },
      ],
    },
    {
      title: "Applications",
      url: "/applications",
      icon: Users,
      items: [
        {
          title: "Received",
          url: "/companydashboard/applications",
        },
        {
          title: "Shortlisted",
          url: "/companydashboard/applications?status=shortlisted",
        },
      ],
    },
    {
        title: "Platform",
        url: "#",
        icon: Settings2,
        items: [
          {
            title: "Settings",
            url: "/settings",
          },
          {
            title: "Help Center",
            url: "/help",
          },
        ],
      },
  ],
}

export function AppSidebar({ ...props }) {
  const [userInfo, setUserInfo] = React.useState(null)
  const navigate = useNavigate()

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem(ACCESS_TOKEN)
        if (token) {
          const res = await api.get("/auth/profile/")
          setUserInfo(res.data)
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      }
    }
    fetchProfile()
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    navigate("/login")
  }

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="py-0 group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent className="relative">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search..."
              className="pl-8 bg-sidebar-accent/50 border-none shadow-none h-9 mt-2"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
          </SidebarGroupContent>
        </SidebarGroup>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userInfo} handleLogout={handleLogout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}