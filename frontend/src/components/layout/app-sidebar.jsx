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
import { useLanguage } from "@/components/language-provider"

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
  const { t } = useLanguage()
  const [userInfo, setUserInfo] = React.useState(null)
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [hasUnreadMessages, setHasUnreadMessages] = React.useState(false)
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

          // Fetch unread count for all roles
          try {
            const notifsRes = await api.get("/notifications/")
            setUnreadCount(notifsRes.data?.unreadCount || 0)
          } catch (err) {
            console.error("Failed to fetch notifications count:", err)
          }

          // Fetch unread messages
          try {
            const msgsRes = await api.get("/messages/")
            const messagesList = msgsRes.data.results || msgsRes.data
            const hasUnread = messagesList.some(
              msg => msg.recipient === res.data.id && !msg.is_read
            )
            setHasUnreadMessages(hasUnread)
          } catch (err) {
            console.error("Failed to fetch unread messages status:", err)
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
      }
    }
    fetchProfile()
  }, [location.pathname])

  // Listen for real-time notification updates
  React.useEffect(() => {
    const handleUpdate = (event) => {
      if (event.detail && typeof event.detail.unreadCount === 'number') {
        setUnreadCount(event.detail.unreadCount)
      }
    }
    window.addEventListener('notificationsUpdated', handleUpdate)
    return () => window.removeEventListener('notificationsUpdated', handleUpdate)
  }, [])

  // Listen for real-time message updates
  React.useEffect(() => {
    const handleMessagesUpdate = (event) => {
      if (event.detail && typeof event.detail.hasUnread === 'boolean') {
        setHasUnreadMessages(event.detail.hasUnread)
      }
    }
    window.addEventListener('messagesUpdated', handleMessagesUpdate)
    return () => window.removeEventListener('messagesUpdated', handleMessagesUpdate)
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
          title: t("sidebarDashboard"),
          url: "/studentdashboard",
          icon: LayoutDashboard,
          isActive: location.pathname === "/studentdashboard",
          items: [
            {
              title: t("sidebarOverview"),
              url: "/studentdashboard",
            },
          ],
        },
        {
          title: t("sidebarMyCV"),
          url: "/studentdashboard/cv",
          icon: FileText,
          isActive: location.pathname.startsWith("/studentdashboard/cv"),
        },
        {
          title: t("sidebarMyApplications"),
          url: "/studentdashboard/MyApplications",
          icon: Users,
          isActive: location.pathname.startsWith("/studentdashboard/MyApplications"),
        },
        {
          title: t("sidebarMessages"),
          url: "/studentdashboard/messages",
          icon: MessageSquare,
          isActive: location.pathname.startsWith("/studentdashboard/messages"),
          badge: hasUnreadMessages,
        },
        {
        title: t("sidebarPlatform"),
        url: "#",
        icon: Settings2,
        items: [
          {
            title: t("sidebarSettings"),
            url: "/settings",
          },
          {
            title: t("sidebarHelpCenter"),
            url: "/help",
          },
        ],
      },
      ]
    } else if (userInfo?.role === "ADMIN_DEPT" || userInfo?.role === "ADMIN_UNIV" || userInfo?.role === "ADMIN") {
        const adminPath = (userInfo.role === "ADMIN_UNIV" || userInfo.role === "ADMIN") ? "/adminunivdashboard" : "/admindashboard";
        baseItems = [
          {
            title: t("sidebarDashboard"),
            url: adminPath,
            icon: LayoutDashboard,
            isActive: location.pathname === adminPath,
            items: [
              {
                title: t("sidebarOverview"),
                url: adminPath,
              },
              {
                title: t("sidebarAnalytics"),
                url: `${adminPath}/analytics`,
              },
            ],
          },
          {
            title: t("sidebarUserManagement"),
            url: `${adminPath}/users`,
            icon: Users,
            isActive: location.pathname.startsWith(`${adminPath}/users`),
          },
          {
            title: t("sidebarCompanies"),
            url: `${adminPath}/companies`,
            icon: SquareTerminal,
            isActive: location.pathname.startsWith(`${adminPath}/companies`),
          },
          {
            title: t("sidebarValidations"),
            url: `${adminPath}/validations`,
            icon: CheckCircle,
            isActive: location.pathname.startsWith(`${adminPath}/validations`),
          },
          {
            title: t("sidebarMessages"),
            url: `${adminPath}/messages`,
            icon: MessageSquare,
            isActive: location.pathname.startsWith(`${adminPath}/messages`),
            badge: hasUnreadMessages,
          },
          {
            title: t("sidebarSettings"),
            url: "/settings",
            icon: Settings2,
          },
        ]
    } else {
      baseItems = [
        {
          title: t("sidebarDashboard"),
          url: "/dashboard",
          icon: LayoutDashboard,
          isActive: true,
          items: [
            { title: t("sidebarOverview"), url: "/dashboard" },
            { title: t("sidebarAnalytics"), url: "/companydashboard/analytics" },
          ],
        },
        {
          title: t("sidebarInternships"),
          url: "/internships",
          icon: SquareTerminal,
          items: [
            { title: t("sidebarBrowseAll"), url: "/internships" },
            { title: t("sidebarMyListings"), url: "/companydashboard/listings" },
            { title: t("sidebarNewPosting"), url: "/companydashboard?newOffer=true" },
          ],
        },
        {
          title: t("sidebarApplications"),
          url: "/companydashboard/applications",
          icon: Users,
        },
        {
          title: t("sidebarMessages"),
          url: "/companydashboard/messages",
          icon: MessageSquare,
          badge: hasUnreadMessages,
        },
        {
          title: t("sidebarPlatform"),
          url: "#",
          icon: Settings2,
          items: [
            { title: t("sidebarSettings"), url: "/settings" },
            { title: t("sidebarHelpCenter"), url: "/help" },
          ],
        },
      ].map(item => {
        const newItem = item.title === "Notifications" ? { ...item, badge: unreadCount > 0 } : item

        // For company role, mark Analytics subitem as coming soon
        if (userInfo?.role === "COMPANY" && newItem.items) {
          return {
            ...newItem,
            items: newItem.items.map(si => {
              if (si.title === t("sidebarAnalytics")) {
                return { ...si, notice: t("comingSoon") }
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
      STUDENT: t("studentPlatform"),
      COMPANY: t("companyPlatform"),
      ADMIN: t("platformAdmin"),
    }
    return subtitleMap[role] || t("sidebarPlatform")
  }, [userInfo, t])

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
              placeholder={t("searchPlaceholder")}
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