import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Park } from "@shared/schema";
import { ArrowUp, ArrowDown, CircleDot, ChevronRight } from "lucide-react";

interface LeaderboardProps {
  parks: Park[];
  voteCount: number;
}

export default function Leaderboard({ parks, voteCount }: LeaderboardProps) {
  // Take the top 5 parks for the leaderboard
  const topParks = parks.slice(0, 5);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-blue-600 p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl font-bold text-white">Park Rankings</CardTitle>
        <CardDescription className="text-blue-100 text-sm">
          Based on {voteCount.toLocaleString()} votes
        </CardDescription>
      </CardHeader>
      
      <div className="divide-y divide-gray-100">
        {topParks.map((park) => (
          <div key={park.id} className="p-3 sm:p-4 flex items-center space-x-2 sm:space-x-3 hover:bg-gray-50">
            {/* Rank */}
            <div className="flex-shrink-0 w-6 sm:w-8 text-center font-bold text-gray-500 text-sm sm:text-base">
              {park.currentRank || 0}.
            </div>
            
            {/* Movement indicator */}
            <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6">
              {park.previousRank && park.currentRank && park.currentRank < park.previousRank ? (
                <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              ) : park.previousRank && park.currentRank && park.currentRank > park.previousRank ? (
                <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
              ) : (
                <CircleDot className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              )}
            </div>
            
            {/* Park image */}
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gray-200">
              {park.image && (
                <img 
                  src={park.image}
                  alt={park.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
            </div>
            
            {/* Park info */}
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{park.name}</p>
              <p className="text-xs text-gray-500 truncate">{park.state}</p>
            </div>
            
            {/* ELO score and rank change */}
            <div className="text-right">
              <p className="text-xs sm:text-sm font-medium text-gray-900">{park.elo}</p>
              {park.previousRank && park.currentRank && park.currentRank < park.previousRank ? (
                <p className="text-xs text-green-600 flex items-center justify-end">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {park.previousRank - park.currentRank}
                </p>
              ) : park.previousRank && park.currentRank && park.currentRank > park.previousRank ? (
                <p className="text-xs text-red-600 flex items-center justify-end">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  {park.currentRank - park.previousRank}
                </p>
              ) : (
                <p className="text-xs text-gray-500 flex items-center justify-end">
                  <CircleDot className="h-3 w-3 mr-1" />
                  0
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <CardContent className="p-3 sm:p-4 border-t">
        <Link href="/rankings">
          <span className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center cursor-pointer">
            View all rankings
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
          </span>
        </Link>
      </CardContent>
    </Card>
  );
}
