import { Link, useLocation } from "wouter";
import { Sparkles } from "lucide-react";
import { Dialog } from "./ui/dialog";
import { useState } from "react";
import Auth from "./Auth";

export default function Header() {
  const [location] = useLocation();
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.href = "/"}>
            <Sparkles className="h-8 w-8 text-green-500" />
            <h1 className="text-xl font-bold text-gray-900">ParkRank</h1>
          </div>
          <nav className="flex items-center space-x-4">
            <div 
              className={`px-3 py-2 text-sm font-medium cursor-pointer ${location === "/about" ? "text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
              onClick={() => window.location.href = "/about"}
            >
              About
            </div>
            <div 
              className={`px-3 py-2 text-sm font-medium cursor-pointer ${location === "/rankings" ? "text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
              onClick={() => window.location.href = "/rankings"}
            >
              Rankings
            </div>
            <div 
              className={`bg-green-500 text-white hover:bg-green-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${location === "/" ? "bg-green-600" : ""}`}
              onClick={() => window.location.href = "/"}
            >
              Vote Now
            </div>
            <div className="flex space-x-2">
              <button
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900"
                onClick={() => {
                  setIsLogin(true);
                  setShowAuth(true);
                }}
              >
                Sign In
              </button>
              <button
                className="px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
                onClick={() => {
                  setIsLogin(false);
                  setShowAuth(true);
                }}
              >
                Sign Up
              </button>
            </div>
          </nav>
        </div>
      </div>
      
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <Dialog.Content className="sm:max-w-md">
          <Dialog.Header>
            <Dialog.Title>{isLogin ? "Sign In" : "Sign Up"}</Dialog.Title>
          </Dialog.Header>
          <Auth initialMode={isLogin} />
        </Dialog.Content>
      </Dialog>
    </header>
  );
}
