import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl text-center">About ParkRank</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p>
            ParkRank is a platform dedicated to discovering which National Parks are the most beloved through a unique voting system. Instead of traditional polls, we use head-to-head matchups that allow users to directly compare parks against each other.
          </p>

          <h3>Our Mission</h3>
          <p>
            Our mission is to create a community-driven ranking of America's National Parks that reflects genuine visitor preferences rather than just visitor statistics. By using the ELO rating system, we can provide dynamic rankings that evolve based on actual preferences.
          </p>

          <h3>How It Works</h3>
          <p>
            Each National Park starts with an ELO rating of 1500 points. When you vote in a matchup:
          </p>
          <ul>
            <li>The winning park gains points from the losing park</li>
            <li>Higher-ranked parks risk more points when facing lower-ranked parks</li>
            <li>Lower-ranked parks can gain significant points by beating higher-ranked parks</li>
          </ul>
          <p>
            This creates a dynamic system where rankings can shift significantly based on voting patterns, providing a real-time reflection of park popularity.
          </p>

          <h3>The ELO Rating System</h3>
          <p>
            The ELO rating system was originally developed for chess rankings by Arpad Elo. It's a comparative rating system where the difference in ratings between two players predicts the expected outcome of a match. The actual outcome is then compared to the expected outcome, and ratings are adjusted accordingly.
          </p>
          <p>
            In ParkRank, we apply this same principle to National Parks. Each park's rating is adjusted after every vote, with the magnitude of adjustment based on the existing rating difference between the parks.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">About U.S. National Parks</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <p>
            The United States has 63 national parks, which are congressionally designated protected areas operated by the National Park Service. These parks represent some of the most spectacular and important natural areas in the country.
          </p>
          <p>
            The first national park, Yellowstone, was established in 1872 by President Ulysses S. Grant. Since then, the national park system has grown to cover over 52 million acres across 30 states and two U.S. territories.
          </p>
          <p>
            National parks see millions of visitors each year, with Great Smoky Mountains National Park typically receiving the highest number of annual visitors - over 14 million in recent years.
          </p>
          <p>
            Our data is sourced from the National Park Service and is regularly updated to ensure accuracy.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
