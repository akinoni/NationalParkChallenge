import { useQuery } from "@tanstack/react-query";
import ParkMatchup from "@/components/ParkMatchup";
import RecentVotes from "@/components/RecentVotes";
import Leaderboard from "@/components/Leaderboard";
import AboutELO from "@/components/AboutELO";
import { Skeleton } from "@/components/ui/skeleton";
import { Park } from "@shared/schema";

export default function Home() {
  const { data: matchup, isLoading: isMatchupLoading, isError: isMatchupError, refetch: refetchMatchup } = useQuery<[Park, Park]>({
    queryKey: ['/api/matchup'],
  });

  const { data: rankingsData, isLoading: isRankingsLoading, isError: isRankingsError, refetch: refetchRankings } = useQuery<Park[]>({
    queryKey: ['/api/rankings'],
  });

  const { data: voteCountData } = useQuery<{ count: number }>({
    queryKey: ['/api/votes/count'],
  });

  const handleMatchupUpdate = () => {
    refetchMatchup();
    refetchRankings();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {/* Left 2/3 */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-8">
          {/* Voting heading */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Which park would you rather visit?</h2>
            <button 
              onClick={handleMatchupUpdate}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center self-end sm:self-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Skip this matchup
            </button>
          </div>
          
          {/* Park matchup */}
          {isMatchupLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Skeleton className="h-[400px] sm:h-[450px] md:h-[480px] w-full rounded-xl" />
              <Skeleton className="h-[400px] sm:h-[450px] md:h-[480px] w-full rounded-xl" />
            </div>
          ) : isMatchupError ? (
            <div className="p-4 sm:p-6 md:p-8 text-center bg-red-50 rounded-xl">
              <p className="text-red-500">Error loading park matchup. Please try again.</p>
              <button 
                onClick={handleMatchupUpdate}
                className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          ) : matchup ? (
            <ParkMatchup 
              park1={matchup[0]} 
              park2={matchup[1]} 
              onVoteSubmitted={handleMatchupUpdate} 
            />
          ) : null}
          
          {/* Recent votes */}
          <RecentVotes />
        </div>
        
        {/* Right 1/3 - Make it appear above matchups on mobile */}
        <div className="order-first lg:order-last mb-4 sm:mb-6 lg:mb-0">
          {/* Leaderboard */}
          {isRankingsLoading ? (
            <Skeleton className="h-[400px] sm:h-[500px] md:h-[600px] w-full rounded-xl" />
          ) : isRankingsError ? (
            <div className="p-4 sm:p-6 md:p-8 text-center bg-red-50 rounded-xl">
              <p className="text-red-500">Error loading rankings. Please try again.</p>
              <button 
                onClick={() => refetchRankings()}
                className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          ) : rankingsData ? (
            <Leaderboard parks={rankingsData} voteCount={voteCountData?.count || 0} />
          ) : null}
          
          {/* About ELO */}
          <AboutELO />
        </div>
      </div>
    </div>
  );
}
