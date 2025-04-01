import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Check } from "lucide-react";
import { Park } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface ParkMatchupProps {
  park1: Park;
  park2: Park;
  onVoteSubmitted: () => void;
}

export default function ParkMatchup({ park1, park2, onVoteSubmitted }: ParkMatchupProps) {
  const [selectedParkId, setSelectedParkId] = useState<number | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const submitVoteMutation = useMutation({
    mutationFn: async ({ winnerId, loserId }: { winnerId: number; loserId: number }) => {
      const voteData: any = {
        winnerParkId: winnerId,
        loserParkId: loserId,
        points: 0 // Points will be calculated on the server
      };
      
      // Add user ID if user is logged in
      if (user) {
        voteData.userId = user.id;
      }
      
      await apiRequest('POST', '/api/vote', voteData);
    },
    onSuccess: () => {
      toast({
        title: "Vote submitted!",
        description: "Your vote has been recorded and rankings updated.",
        duration: 3000,
      });
      
      // Wait a moment before fetching new matchup to allow user to see the confirmation
      setTimeout(() => {
        onVoteSubmitted();
        setSelectedParkId(null);
      }, 1500);
    },
    onError: (error) => {
      toast({
        title: "Error submitting vote",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
        duration: 5000,
      });
    }
  });

  const handleVote = (parkId: number) => {
    if (submitVoteMutation.isPending) return;
    
    setSelectedParkId(parkId);
    
    const winnerId = parkId;
    const loserId = parkId === park1.id ? park2.id : park1.id;
    
    submitVoteMutation.mutate({ winnerId, loserId });
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Park 1 */}
      <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${selectedParkId === park1.id ? 'border-2 border-green-500' : ''}`}>
        <div className="relative h-48 sm:h-56 md:h-48 lg:h-56">
          <div className="absolute inset-0 bg-gray-200">
            {park1.image && (
              <img 
                src={park1.image}
                alt={park1.name}
                className="w-full h-full object-cover"
                onError={(e) => { 
                  // Use default background if image fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            {park1.tag && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-2">
                {park1.tag}
              </span>
            )}
            <h3 className="text-lg sm:text-xl font-bold text-white truncate">{park1.name}</h3>
            <p className="text-xs sm:text-sm text-white/90 truncate">{park1.state}</p>
          </div>
        </div>
        <CardContent className="p-3 sm:p-4">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm text-gray-500">Rank: <span className="font-bold text-gray-900">#{park1.currentRank}</span></span>
            <span className="text-xs sm:text-sm text-gray-500">ELO: <span className="font-bold text-gray-900">{park1.elo}</span></span>
          </div>
          <div className="flex flex-col space-y-1 sm:space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-500">Annual Visitors:</span>
              <span className="font-medium">{formatNumber(park1.visitors)}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-500">Established:</span>
              <span className="font-medium">{park1.established}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-500">Size:</span>
              <span className="font-medium">{formatNumber(park1.size)} acres</span>
            </div>
          </div>
          <Button
            onClick={() => handleVote(park1.id)}
            disabled={submitVoteMutation.isPending}
            className={`w-full mt-3 sm:mt-4 text-sm sm:text-base ${selectedParkId === park1.id ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {selectedParkId === park1.id ? (
              <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            ) : (
              <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            )}
            {selectedParkId === park1.id ? 'Vote Recorded' : 'Vote For This Park'}
          </Button>
        </CardContent>
      </Card>

      {/* Park 2 */}
      <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${selectedParkId === park2.id ? 'border-2 border-green-500' : ''}`}>
        <div className="relative h-48 sm:h-56 md:h-48 lg:h-56">
          <div className="absolute inset-0 bg-gray-200">
            {park2.image && (
              <img 
                src={park2.image}
                alt={park2.name}
                className="w-full h-full object-cover"
                onError={(e) => { 
                  // Use default background if image fails to load
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            {park2.tag && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mb-2">
                {park2.tag}
              </span>
            )}
            <h3 className="text-lg sm:text-xl font-bold text-white truncate">{park2.name}</h3>
            <p className="text-xs sm:text-sm text-white/90 truncate">{park2.state}</p>
          </div>
        </div>
        <CardContent className="p-3 sm:p-4">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm text-gray-500">Rank: <span className="font-bold text-gray-900">#{park2.currentRank}</span></span>
            <span className="text-xs sm:text-sm text-gray-500">ELO: <span className="font-bold text-gray-900">{park2.elo}</span></span>
          </div>
          <div className="flex flex-col space-y-1 sm:space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-500">Annual Visitors:</span>
              <span className="font-medium">{formatNumber(park2.visitors)}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-500">Established:</span>
              <span className="font-medium">{park2.established}</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-500">Size:</span>
              <span className="font-medium">{formatNumber(park2.size)} acres</span>
            </div>
          </div>
          <Button
            onClick={() => handleVote(park2.id)}
            disabled={submitVoteMutation.isPending}
            variant={selectedParkId === park2.id ? "default" : "outline"}
            className={`w-full mt-3 sm:mt-4 text-sm sm:text-base ${selectedParkId === park2.id ? 'bg-green-600' : ''}`}
          >
            {selectedParkId === park2.id ? (
              <Check className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            ) : (
              <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
            )}
            {selectedParkId === park2.id ? 'Vote Recorded' : 'Vote For This Park'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
