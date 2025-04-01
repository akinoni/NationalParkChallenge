import { Link, useLocation } from "wouter";
import { Sparkles } from "lucide-react";

export default function Header() {
  const [location] = useLocation();

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
          </nav>
        </div>
      </div>
    </header>
  );
}
