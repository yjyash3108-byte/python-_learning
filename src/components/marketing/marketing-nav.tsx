"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { GraduationCap, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#clubs", label: "Clubs" },
  { href: "#opportunities", label: "Opportunities" },
  { href: "#why", label: "Why Us" },
  { href: "#faq", label: "FAQ" },
] as const;

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const navOpacity = useTransform(scrollY, [0, 80], [0.9, 1]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ opacity: navOpacity }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-white/10 bg-background/85 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl"
          : "border-transparent bg-background/50 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5 font-semibold text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/30 transition group-hover:scale-105">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="hidden text-lg sm:inline text-3d-glow">{APP_NAME}</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-muted-foreground transition hover:text-indigo-300"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button
            asChild
            className="btn-3d hidden bg-gradient-to-r from-indigo-500 to-cyan-500 shadow-[0_4px_20px_rgba(99,102,241,0.35)] sm:inline-flex"
          >
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="border-white/15 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-white/10 bg-background/95 px-4 py-4 backdrop-blur-xl lg:hidden"
        >
          <nav className="flex flex-col gap-3">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Link href="/login" className="text-sm">
              Sign in
            </Link>
            <Link href="/signup" className="text-sm font-medium text-indigo-400">
              Get Started
            </Link>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
}
