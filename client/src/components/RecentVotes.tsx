import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ParkWithVoteInfo } from "@shared/schema";

export default function RecentVotes() {
  const { data: recentVotes, isLoading, isError } = useQuery<ParkWithVoteInfo[]>({
    queryKey: ['/api/votes/recent'],
    // Refetch every 10 seconds to keep recent votes updated
    refetchInterval: 10000,
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Recent Votes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-4 text-center bg-red-50 rounded-lg">
            <p className="text-red-500">Error loading recent votes. Please try again later.</p>
          </div>
        ) : recentVotes && recentVotes.length > 0 ? (
          <div className="space-y-3">
            {recentVotes.map((vote, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                    {vote.image && (
                      <img 
                        src={vote.image}
                        alt={vote.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{vote.name}</p>
                    <p className="text-xs text-gray-500">beat</p>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-400">
                  <span className="inline-block bg-white py-1 px-2 rounded border text-xs">
                    +{vote.points || 0}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium text-gray-900 text-right">{vote.loserName}</p>
                    <p className="text-xs text-gray-500 text-right">{vote.timeSince}</p>
                  </div>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                    {vote.loserImage && (
                      <img 
                        src={vote.loserImage}
                        alt={vote.loserName || 'Losing park'}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No votes recorded yet. Be the first to vote!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
