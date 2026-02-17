import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/Navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Meal Planner",
  description: "Plan your weekly meals, manage recipes, and generate shopping lists.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-gray-50 min-h-screen`}>
        <Navigation />

        {/* Bottom padding on mobile accounts for the fixed tab bar height (64px) */}
        <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-24 md:px-6 md:pb-6">
          {children}
        </main>
      </body>
    </html>
  )
}
