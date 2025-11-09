"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, FileText, Upload, Clock, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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

  const isActivePath = (path: string) => {
    if (path === "/dashboard/home") {
      return pathname === "/dashboard/home" || pathname === "/dashboard";
    }
    return pathname === path || pathname.startsWith(path + "/");
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

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard/home"
              className={`flex items-center gap-2 px-2 py-1 text-sm font-medium transition-colors rounded-md ${
                isActivePath("/dashboard/home")
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Upload className="h-4 w-4" />
              Upload
            </Link>
            <Link
              href="/dashboard/history"
              className={`flex items-center gap-2 px-2 py-1 text-sm font-medium transition-colors rounded-md ${
                isActivePath("/dashboard/history")
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Clock className="h-4 w-4" />
              History
            </Link>
            <Link
              href="/dashboard/settings"
              className={`flex items-center gap-2 px-2 py-1 text-sm font-medium transition-colors rounded-md ${
                isActivePath("/dashboard/settings")
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Settings className="h-4 w-4" />
              Settings
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

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-md shadow-lg z-50">
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(
                              session.user.name || session.user.email || "U"
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {session.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {session.user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      {/* Navigation links - only show on mobile */}
                      <div className="md:hidden">
                        <Link
                          href="/dashboard/home"
                          className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </Link>
                        <Link
                          href="/dashboard/history"
                          className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          History
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          className="flex items-center px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                        <div className="border-t border-border my-1"></div>
                      </div>
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
