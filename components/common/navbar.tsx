"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOut,
  FileText,
  ChevronDown,
  Upload,
  History,
  Settings,
  Home
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
    setIsDropdownOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string) => {
    if (path === "/dashboard/home") {
      return pathname === "/dashboard/home" || pathname === "/dashboard";
    }
    return pathname === path;
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/dashboard/home"
              className="flex items-center space-x-2"
            >
              <FileText className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">PDF Scraper</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard/home"
              className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                isActive("/dashboard/home")
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              href="/dashboard/history"
              className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                isActive("/dashboard/history")
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <History className="h-4 w-4" />
              <span>History</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                isActive("/dashboard/settings")
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center space-x-1">
            <Link
              href="/dashboard/home"
              className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                isActive("/dashboard/home")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Home className="h-5 w-5" />
            </Link>
            <Link
              href="/dashboard/history"
              className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                isActive("/dashboard/history")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <History className="h-5 w-5" />
            </Link>
            <Link
              href="/dashboard/settings"
              className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                isActive("/dashboard/settings")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Settings className="h-5 w-5" />
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
            ) : session?.user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Avatar Button */}
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full hover:bg-muted"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(
                        session.user.name || session.user.email || "U"
                      )}
                    </AvatarFallback>
                  </Avatar>
                </Button>

                {/* Desktop Dropdown Menu - Only Logout */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link href="/auth/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
