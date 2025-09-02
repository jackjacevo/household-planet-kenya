'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Search, Menu, User, Heart } from 'lucide-react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold text-foreground">Household Planet</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Products
            </Link>
            <Link href="/categories" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Categories
            </Link>
            <Link href="/deals" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Deals
            </Link>
            <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              About
            </Link>
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search products..."
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <button className="p-2 text-foreground hover:text-primary transition-colors">
              <Heart className="h-5 w-5" />
            </button>
            
            <button className="p-2 text-foreground hover:text-primary transition-colors">
              <User className="h-5 w-5" />
            </button>
            
            <button className="relative p-2 text-foreground hover:text-primary transition-colors">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <Link href="/products" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Products
              </Link>
              <Link href="/categories" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Categories
              </Link>
              <Link href="/deals" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Deals
              </Link>
              <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                About
              </Link>
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 text-sm bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}