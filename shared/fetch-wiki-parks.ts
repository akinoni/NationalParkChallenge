import axios from 'axios';
import * as cheerio from 'cheerio';
import { InsertPark } from '@shared/schema';

export async function fetchWikipediaParks(): Promise<InsertPark[]> {
  try {
    // Fetch the Wikipedia page
    const response = await axios.get('https://en.wikipedia.org/wiki/List_of_national_parks_of_the_United_States');
    
    // Parse HTML with cheerio
    const $ = cheerio.load(response.data);
    
    // Find the main table containing park data
    const parkTable = $('table.wikitable');
    
    // Initialize array for park data
    const parks: InsertPark[] = [];
    
    // Process each row in the table (skip the header row)
    parkTable.find('tr').slice(1).each((index, element) => {
      const cells = $(element).find('td');
      
      // Check if this is a valid row with enough cells
      if (cells.length >= 6) {
        // Extract image URL
        let imageUrl = '';
        const imgElement = cells.eq(0).find('img');
        if (imgElement.length > 0) {
          const srcAttribute = imgElement.attr('src');
          if (srcAttribute) {
            // Convert relative URLs to absolute
            if (srcAttribute.startsWith('//')) {
              imageUrl = 'https:' + srcAttribute;
            } else {
              imageUrl = srcAttribute;
            }
          }
        }
        
        // Extract park name
        const nameCell = cells.eq(1);
        const parkName = nameCell.find('a').first().text().trim();
        
        // Extract state
        const stateCell = cells.eq(2);
        const state = stateCell.text().trim();
        
        // Extract established date from year column
        const yearCell = cells.eq(3);
        const establishedText = yearCell.text().trim();
        const establishedYear = parseInt(establishedText.match(/\d{4}/)?.[0] || '0', 10);
        
        // Extract size in acres
        const areaCell = cells.eq(4);
        const areaText = areaCell.text().trim().replace(/,/g, '');
        const sizeMatch = areaText.match(/(\d+)/);
        const size = sizeMatch ? parseInt(sizeMatch[1], 10) : 0;
        
        // Extract description (using a combination of information)
        const descriptionCell = cells.eq(5);
        let description = descriptionCell.text().trim();
        
        // Extract approximate visitor count (in millions or precise count)
        const visitorCell = cells.eq(6);
        const visitorText = visitorCell.text().trim();
        let visitors = 0;

        if (visitorText.includes('million')) {
          const millionMatch = visitorText.match(/([\d.]+)\s*million/);
          if (millionMatch) {
            visitors = Math.round(parseFloat(millionMatch[1]) * 1000000);
          }
        } else {
          const visitorMatch = visitorText.replace(/,/g, '').match(/(\d+)/);
          if (visitorMatch) {
            visitors = parseInt(visitorMatch[1], 10);
          }
        }
        
        // Create park object
        if (parkName) {
          const park: InsertPark = {
            name: parkName,
            state: state,
            description: description,
            image: imageUrl,
            visitors: visitors || 100000, // Fallback if visitors data is missing
            established: establishedYear,
            size: size,
            elo: 1500 // Starting ELO rating
          };
          
          // Add tag for special parks
          if (index === 0) {
            park.tag = "Most Visited";
          } else if (parkName === "Yellowstone") {
            park.tag = "First National Park";
          } else if (visitors > 3000000) {
            park.tag = "Popular";
          }
          
          parks.push(park);
        }
      }
    });
    
    console.log(`Fetched ${parks.length} parks from Wikipedia`);
    return parks;
    
  } catch (error) {
    console.error('Error fetching Wikipedia data:', error);
    throw error;
  }
}