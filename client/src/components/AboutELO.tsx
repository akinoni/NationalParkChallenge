import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutELO() {
  return (
    <Card className="mt-4 sm:mt-6">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-base sm:text-lg">About ELO Ranking</CardTitle>
      </CardHeader>
      <CardContent className="text-xs sm:text-sm">
        <p className="text-gray-500 mb-3 sm:mb-4">
          The ELO rating system was originally developed for chess rankings. In ParkRank, when you vote between two parks:
        </p>
        <ul className="text-gray-500 space-y-1 sm:space-y-2 list-disc pl-4 sm:pl-5">
          <li>The winning park gains points from the losing park</li>
          <li>Higher ranked parks risk more points when facing lower ranked parks</li>
          <li>Lower ranked parks can gain significant points by beating higher ranked parks</li>
          <li>All parks start with 1500 points</li>
        </ul>
        <div className="mt-3 pt-3 sm:mt-4 sm:pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Parks data sourced from the National Park Service. Updated April 2024.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
