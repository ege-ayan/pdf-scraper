"use client";

import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOut,
  FileText,
  ChevronDown,
  Upload,
  History,
  Settings,
  Home,
  Menu,
  X,
  User,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Close mobile menu on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isActiveLink = (href: string) => {
    if (href === "/dashboard/home") {
      return pathname === "/dashboard/home" || pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  const navigationItems = [
    { href: "/dashboard/home", label: "Upload", icon: Upload },
    { href: "/dashboard/history", label: "History", icon: History },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

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
            {navigationItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                  isActiveLink(href)
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <div className="flex flex-col space-y-1">
                <div className={`h-0.5 w-4 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                <div className={`h-0.5 w-4 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                <div className={`h-0.5 w-4 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
              </div>
            </Button>
          </div>

          {/* Desktop Avatar - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4">
            {status === "loading" ? (
              <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
            ) : session?.user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Avatar Button */}
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full hover:bg-muted"
                  onClick={() => {
                    setIsDropdownOpen(!isDropdownOpen);
                    setIsMobileMenuOpen(false);
                  }}
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

      {/* Mobile Overlay Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu */}
          <div className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-background border-r border-border shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <Link
                  href="/dashboard/home"
                  className="flex items-center space-x-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FileText className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">PDF Scraper</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* User Info Section */}
              {session?.user && (
                <div className="p-4 border-b border-border bg-muted/30">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {getInitials(session.user.name || session.user.email || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <div className="flex-1 px-4 py-6">
                <div className="space-y-2">
                  {navigationItems.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`flex items-center space-x-3 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActiveLink(href)
                          ? "bg-primary/10 text-primary font-semibold shadow-sm"
                          : "text-foreground hover:bg-muted hover:shadow-sm"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sign Out */}
              {session?.user && (
                <div className="p-4 border-t border-border">
                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full px-3 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Sign out
                  </button>
                </div>
              )}

              {/* Auth Links for Non-logged-in Users */}
              {!session?.user && (
                <div className="p-4 border-t border-border space-y-2">
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <User className="mr-3 h-5 w-5" />
                      Sign in
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start">
                    <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
