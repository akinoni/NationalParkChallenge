import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Park } from "@shared/schema";
import { ArrowUp, ArrowDown, CircleDot } from "lucide-react";

interface LeaderboardProps {
  parks: Park[];
  voteCount: number;
}

export default function Leaderboard({ parks, voteCount }: LeaderboardProps) {
  // Take the top 5 parks for the leaderboard
  const topParks = parks.slice(0, 5);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-blue-600 p-6">
        <CardTitle className="text-xl font-bold text-white">Park Rankings</CardTitle>
        <CardDescription className="text-blue-100">
          Based on {voteCount.toLocaleString()} votes
        </CardDescription>
      </CardHeader>
      
      <div className="divide-y divide-gray-100">
        {topParks.map((park) => (
          <div key={park.id} className="p-4 flex items-center space-x-3 hover:bg-gray-50">
            <div className="flex-shrink-0 w-8 text-center font-bold text-gray-500">{park.currentRank}.</div>
            <div className="flex-shrink-0 w-6 h-6">
              {park.previousRank && park.currentRank < park.previousRank ? (
                <ArrowUp className="h-5 w-5 text-green-500" />
              ) : park.previousRank && park.currentRank > park.previousRank ? (
                <ArrowDown className="h-5 w-5 text-red-500" />
              ) : (
                <CircleDot className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-200">
              {/* Image placeholder */}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">{park.name}</p>
              <p className="text-xs text-gray-500">{park.state}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{park.elo}</p>
              {park.previousRank && park.currentRank < park.previousRank ? (
                <p className="text-xs text-green-600 flex items-center justify-end">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  {park.previousRank - park.currentRank}
                </p>
              ) : park.previousRank && park.currentRank > park.previousRank ? (
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
      
      <CardContent className="p-4 border-t">
        <Link href="/rankings">
          <a className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center">
            View all rankings
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </Link>
      </CardContent>
    </Card>
  );
}
