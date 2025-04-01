import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Park } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

export default function Rankings() {
  const { data: rankings, isLoading, isError } = useQuery<Park[]>({
    queryKey: ['/api/rankings'],
  });

  const { data: voteCountData } = useQuery<{ count: number }>({
    queryKey: ['/api/votes/count'],
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="w-full">
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-2xl">Complete Park Rankings</CardTitle>
          <CardDescription className="text-blue-100">
            Based on {voteCountData?.count?.toLocaleString() || "0"} votes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center bg-red-50 rounded-lg">
              <p className="text-red-500">Error loading rankings data. Please try again later.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead className="w-16">Change</TableHead>
                  <TableHead>Park</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">ELO Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankings?.map((park) => (
                  <TableRow key={park.id}>
                    <TableCell className="font-medium">{park.currentRank}</TableCell>
                    <TableCell>
                      {park.previousRank && park.currentRank < park.previousRank ? (
                        <span className="flex items-center text-green-600">
                          <ArrowUp className="h-4 w-4 mr-1" />
                          {park.previousRank - park.currentRank}
                        </span>
                      ) : park.previousRank && park.currentRank > park.previousRank ? (
                        <span className="flex items-center text-red-600">
                          <ArrowDown className="h-4 w-4 mr-1" />
                          {park.currentRank - park.previousRank}
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-400">
                          <Minus className="h-4 w-4 mr-1" />
                          0
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{park.name}</TableCell>
                    <TableCell>{park.state}</TableCell>
                    <TableCell className="text-right">{park.elo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
