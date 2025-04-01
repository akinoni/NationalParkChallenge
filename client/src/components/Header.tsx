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
import { Loader2, User } from "lucide-react";

export default function Header() {
  const { user, isLoading, logoutMutation } = useAuth();

  return (
    <header className="bg-primary/10 border-b">
      <div className="container mx-auto flex justify-between items-center py-4">
        <Link href="/">
          <span className="text-xl font-bold hover:text-primary transition-colors cursor-pointer">
            National Parks ELO
          </span>
        </Link>
        
        <nav>
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
                      <span>{user.username}</span>
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
      </div>
    </header>
  );
}