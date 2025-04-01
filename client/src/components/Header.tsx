import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { user, isLoading, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-primary/10 border-b">
      <div className="container mx-auto flex justify-between items-center py-4 px-4 sm:px-6">
        <Link href="/">
          <span className="text-xl font-bold hover:text-primary transition-colors cursor-pointer truncate">
            National Parks ELO
          </span>
        </Link>
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden flex items-center"
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6 items-center">
            <li>
              <Link href="/">
                <span className="hover:text-primary transition-colors cursor-pointer">Home</span>
              </Link>
            </li>
            <li>
              <Link href="/rankings">
                <span className="hover:text-primary transition-colors cursor-pointer">Rankings</span>
              </Link>
            </li>
            <li>
              <Link href="/about">
                <span className="hover:text-primary transition-colors cursor-pointer">About</span>
              </Link>
            </li>
            
            {isLoading ? (
              <li>
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </li>
            ) : user ? (
              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline">{user.username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => logoutMutation.mutate()}>
                      {logoutMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Signing out...
                        </>
                      ) : (
                        "Sign out"
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ) : (
              <li>
                <Link href="/auth">
                  <span>
                    <Button>Sign In</Button>
                  </span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col pt-16">
            <div className="absolute top-4 right-4">
              <button 
                onClick={toggleMobileMenu}
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="flex flex-col items-center justify-center flex-1">
              <ul className="space-y-6 text-center">
                <li>
                  <Link href="/">
                    <span 
                      className="text-xl font-medium hover:text-primary transition-colors cursor-pointer"
                      onClick={toggleMobileMenu}
                    >
                      Home
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/rankings">
                    <span 
                      className="text-xl font-medium hover:text-primary transition-colors cursor-pointer"
                      onClick={toggleMobileMenu}
                    >
                      Rankings
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/about">
                    <span 
                      className="text-xl font-medium hover:text-primary transition-colors cursor-pointer"
                      onClick={toggleMobileMenu}
                    >
                      About
                    </span>
                  </Link>
                </li>
                
                {isLoading ? (
                  <li className="flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </li>
                ) : user ? (
                  <li className="flex flex-col items-center space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.username}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        logoutMutation.mutate();
                        toggleMobileMenu();
                      }}
                      disabled={logoutMutation.isPending}
                    >
                      {logoutMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Signing out...
                        </>
                      ) : (
                        "Sign out"
                      )}
                    </Button>
                  </li>
                ) : (
                  <li>
                    <Link href="/auth">
                      <span onClick={toggleMobileMenu}>
                        <Button size="lg">Sign In</Button>
                      </span>
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}