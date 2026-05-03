"use client"

import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  Settings2,
  SquareTerminal,
  Users,
  Search,
  FileText,
  Bell,
  AlertCircle,
  CheckCircle,
  MessageSquare,
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
import logoGif from "@/assets/logo.gif"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/dashboard",
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
          url: "/companydashboard?newOffer=true",
        },
      ],
    },
    {
      title: "Applications",
      url: "/companydashboard/applications",
      icon: Users,
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
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [noticeMessage, setNoticeMessage] = React.useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem(ACCESS_TOKEN)
        if (token) {
          const res = await api.get("/auth/profile/")
          setUserInfo(res.data)

          // Fetch unread count
          if (res.data?.role === 'COMPANY') {
            try {
              const notifsRes = await api.get("/notifications/")
              setUnreadCount(notifsRes.data?.unreadCount || 0)
            } catch (err) {
              console.error("Failed to fetch notifications count:", err)
            }
          }
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

  const navItems = React.useMemo(() => {
    if (!userInfo) return []

    // Student sidebar: 
    let baseItems = []
    if (userInfo?.role === "STUDENT") {
      baseItems = [
        {
          title: "Dashboard",
          url: "/studentdashboard",
          icon: LayoutDashboard,
          isActive: location.pathname === "/studentdashboard",
          items: [
            {
              title: "Overview",
              url: "/studentdashboard",
            },
          ],
        },
        {
          title: "My CV",
          url: "/studentdashboard/cv",
          icon: FileText,
          isActive: location.pathname.startsWith("/studentdashboard/cv"),
        },
        {
          title: "My applications",
          url: "/studentdashboard/MyApplications",
          icon: Users,
          isActive: location.pathname.startsWith("/studentdashboard/MyApplications"),
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
      ]
    } else if (userInfo?.role === "ADMIN") {
        baseItems = [
          {
            title: "Dashboard",
            url: "/admindashboard",
            icon: LayoutDashboard,
            isActive: location.pathname === "/admindashboard",
            items: [
              {
                title: "Overview",
                url: "/admindashboard",
              },
              {
                title: "Analytics",
                url: "/admindashboard/analytics",
              },
            ],
          },
          {
            title: "User Management",
            url: "/admindashboard/users",
            icon: Users,
            isActive: location.pathname.startsWith("/admindashboard/users"),
          },
          {
            title: "Companies",
            url: "/admindashboard/companies",
            icon: SquareTerminal,
            isActive: location.pathname.startsWith("/admindashboard/companies"),
          },
          {
            title: "Validations",
            url: "/admindashboard/validations",
            icon: CheckCircle,
            isActive: location.pathname.startsWith("/admindashboard/validations"),
          },
          {
            title: "Messages",
            url: "/admindashboard/messages",
            icon: MessageSquare,
            isActive: location.pathname.startsWith("/admindashboard/messages"),
          },
          {
            title: "Settings",
            url: "/settings",
            icon: Settings2,
          },
        ]
    } else {
      baseItems = data.navMain.map(item => {
        const newItem = item.title === "Notifications" ? { ...item, badge: unreadCount > 0 } : item

        // For company role, mark Analytics subitem as coming soon
        if (userInfo?.role === "COMPANY" && newItem.items) {
          return {
            ...newItem,
            items: newItem.items.map(si => {
              if (si.title === "Analytics") {
                return { ...si, notice: "Coming soon..." }
              }
              return si
            })
          }
        }

        return newItem
      })
    }

    // Filter items based on search query
    if (!searchQuery.trim()) {
      return baseItems
    }

    const query = searchQuery.toLowerCase()
    return baseItems
      .map(item => {
        const titleMatch = item.title.toLowerCase().includes(query)
        const itemsMatch = item.items?.filter(subItem =>
          subItem.title.toLowerCase().includes(query)
        ) || []

        if (titleMatch) {
          return item
        }

        if (itemsMatch.length > 0) {
          return {
            ...item,
            items: itemsMatch,
          }
        }

        return null
      })
      .filter(Boolean)
  }, [location.pathname, userInfo, unreadCount, searchQuery])

  const getSubtitle = React.useMemo(() => {
    const role = userInfo?.role ? String(userInfo.role).toUpperCase() : ""
    const subtitleMap = {
      STUDENT: "Student Platform",
      COMPANY: "Company Platform",
      ADMIN: "Platform Admin",
    }
    return subtitleMap[role] || "Platform"
  }, [userInfo])

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher 
          logoSrc={logoGif}
          name="Stag.Io"
          subtitle={getSubtitle}
        />
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 bg-sidebar-accent/50 border-none shadow-none h-9 mt-2"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
          </SidebarGroupContent>
        </SidebarGroup>
        {noticeMessage && (
          <div className="mb-3 px-2 py-2 rounded-full bg-purple-400 text-white flex items-center gap-3 shadow-sm">
            <div >
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
            <span className="text-md font-medium">{noticeMessage}</span>
          </div>
        )}
        <NavMain items={navItems} onAction={(subItem) => {
          if (subItem?.notice) {
            setNoticeMessage(subItem.notice)
            setTimeout(() => setNoticeMessage(null), 1000)
          }
        }} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userInfo} handleLogout={handleLogout} unreadCount={unreadCount} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}