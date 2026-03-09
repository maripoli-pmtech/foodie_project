"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Calendar, ShoppingCart, UtensilsCrossed, Carrot } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/recipes", label: "Recipes", icon: BookOpen },
  { href: "/ingredients", label: "Ingredients", icon: Carrot },
  { href: "/planner", label: "Planner", icon: Calendar },
  { href: "/shopping", label: "Shopping List", icon: ShoppingCart },
]

const mobileLinks = [
  { href: "/recipes", label: "Recipes", icon: BookOpen },
  { href: "/ingredients", label: "Ingredients", icon: Carrot },
  { href: "/planner", label: "Planner", icon: Calendar },
  { href: "/shopping", label: "Shopping", icon: ShoppingCart },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <>
      {/* ── Desktop: top nav bar ── */}
      <header className="hidden md:flex sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3">
          {/* Logo / App name */}
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors"
          >
            <UtensilsCrossed className="h-5 w-5 text-emerald-600" />
            <span>Meal Planner</span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive =
                href === "/"
                  ? pathname === "/"
                  : pathname === href || pathname.startsWith(href + "/")
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* ── Mobile: bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t bg-white">
        <div className="flex h-16">
          {mobileLinks.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
                  isActive
                    ? "text-emerald-600"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-emerald-600" : "text-gray-400"
                  )}
                />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
