import axios from 'axios';
import * as cheerio from 'cheerio';
import { InsertPark } from '@shared/schema';

export async function fetchWikipediaParks(): Promise<InsertPark[]> {
  try {
    // Fetch the Wikipedia page
    const response = await axios.get('https://en.wikipedia.org/wiki/List_of_national_parks_of_the_United_States');
    
    // Parse HTML with cheerio
    const $ = cheerio.load(response.data);
    
    // Debugging: Log all tables found
    console.log(`Found ${$('table.wikitable').length} wikitables on the page`);
    
    // Find the correct table that contains the list of 63 national parks
    // The main table has a caption that mentions "National Parks"
    let parkTable: any = null;
    
    $('table.wikitable').each((i, table) => {
      const captionText = $(table).find('caption').text().toLowerCase();
      const hasParksHeader = $(table).find('th:contains("Park")').length > 0;
      const tableCellCount = $(table).find('tr:first-child td, tr:first-child th').length;
      
      console.log(`Table ${i}: Caption: "${captionText}", Has "Park" header: ${hasParksHeader}, Cell count: ${tableCellCount}`);
      
      // The correct table typically has a caption about national parks, has "Park" in header and has 7+ columns
      if (hasParksHeader && tableCellCount >= 7) {
        parkTable = $(table);
      }
    });
    
    if (!parkTable) {
      // If we couldn't identify the right table, try to find it based on structure
      // The national parks table typically has columns for Image, Park name, State, etc.
      $('table.wikitable').each((i, table) => {
        const headers = $(table).find('tr:first-child th').map((i, el) => $(el).text().trim()).get();
        console.log(`Table ${i} headers: ${headers.join(' | ')}`);
        
        // Check for common headers in the national parks table
        if (headers.some(h => h.includes('Park')) && 
            headers.some(h => h.includes('Image') || h.includes('Photo'))) {
          parkTable = $(table);
        }
      });
    }
    
    if (!parkTable) {
      console.error('Could not find the National Parks table');
      
      // Last resort: just use the largest table with many rows
      $('table.wikitable').each((i, table) => {
        const rowCount = $(table).find('tr').length;
        console.log(`Table ${i} has ${rowCount} rows`);
        if (rowCount > 60) { // We expect at least 63 parks plus a header row
          parkTable = $(table);
        }
      });
      
      if (!parkTable) {
        // Absolute fallback - use first table that has enough rows
        $('table.wikitable').each((i, table) => {
          const rowCount = $(table).find('tr').length;
          if (rowCount > 10 && !parkTable) {
            parkTable = $(table);
          }
        });
      }
    }
    
    if (!parkTable) {
      throw new Error('Could not find any suitable table for national parks');
    }
    
    // Initialize array for park data and a set to track unique park names
    const parks: InsertPark[] = [];
    const parkNames = new Set<string>();
    
    // Process each row in the table (skip the header row)
    parkTable.find('tr').slice(1).each((index: number, element: any) => {
      const cells = $(element).find('td');
      
      // Skip rows without enough cells
      if (cells.length < 5) {
        return;
      }
      
      // Determine if this is a valid national park row (not a header or other information)
      // We expect park information to have an image, name, state, etc.
      
      // Extract image URL from the image column (usually first column)
      let imageUrl = '';
      const imgElement = $(element).find('img').first();
      if (imgElement.length > 0) {
        // Get the src attribute, typically a thumbnail
        let srcAttribute = imgElement.attr('src');
        if (srcAttribute) {
          // Convert relative URLs to absolute
          if (srcAttribute.startsWith('//')) {
            imageUrl = 'https:' + srcAttribute;
          } else {
            imageUrl = srcAttribute;
          }
          
          // Use a larger version by modifying the URL pattern
          // Thumbnail URLs typically have /thumb/ in the path and a px size suffix
          imageUrl = imageUrl.replace(/\/thumb\//, '/');
          // Remove the size suffix (e.g., /100px-filename.jpg -> /filename.jpg)
          imageUrl = imageUrl.replace(/\/\d+px-([^\/]+)$/, '/$1');
        }
      }
      
      // Extract park name - look for links in the first few cells
      let parkName = '';
      for (let i = 0; i < Math.min(3, cells.length); i++) {
        const possibleName = cells.eq(i).find('a').first().text().trim();
        if (possibleName && possibleName.length > 3) {
          parkName = possibleName;
          break;
        }
      }
      
      // If no name with link found, try text content
      if (!parkName) {
        for (let i = 0; i < Math.min(3, cells.length); i++) {
          const possibleName = cells.eq(i).text().trim();
          if (possibleName && possibleName.length > 3 && !possibleName.match(/^[\d.,]+$/)) {
            parkName = possibleName;
            break;
          }
        }
      }
      
      // Skip if no valid park name found or we already have this park
      if (!parkName || parkNames.has(parkName)) {
        return;
      }
      
      // Extract state/territory - look for a cell that matches common state patterns
      let state = '';
      for (let i = 0; i < cells.length; i++) {
        const text = cells.eq(i).text().trim();
        // Check if this cell contains state abbreviations or common state names
        if (text.match(/[A-Z]{2}/) || 
            text.includes('California') || 
            text.includes('Alaska') || 
            text.includes('Hawaii') ||
            text.includes('Colorado')) {
          state = text;
          break;
        }
      }
      
      // Extract established date and year
      let establishedYear = 0;
      let establishedText = '';
      
      for (let i = 0; i < cells.length; i++) {
        const text = cells.eq(i).text().trim();
        const yearMatch = text.match(/\b(18|19|20)\d{2}\b/); // Match years from 1800s to 2000s
        if (yearMatch) {
          establishedYear = parseInt(yearMatch[0], 10);
          establishedText = text;
          break;
        }
      }
      
      // Extract size in acres
      let size = 0;
      for (let i = 0; i < cells.length; i++) {
        const text = cells.eq(i).text().trim().replace(/,/g, '');
        // Look for numbers followed by "acres" or just large numbers
        if (text.includes('acre') || text.match(/\b\d{3,}\b/)) {
          const sizeMatch = text.match(/(\d+)/);
          if (sizeMatch) {
            size = parseInt(sizeMatch[0], 10);
            break;
          }
        }
      }
      
      // Extract description - use a cell with longer text
      let description = '';
      for (let i = 0; i < cells.length; i++) {
        const text = cells.eq(i).text().trim();
        if (text.length > 20 && !text.match(/^\d+$/) && !text.includes('acre')) {
          description = text;
          break;
        }
      }
      
      // If no good description found, create a simple one
      if (!description) {
        description = `${parkName} National Park` + (state ? ` in ${state}` : '');
      }
      
      // Extract visitor count
      let visitors = 0;
      for (let i = 0; i < cells.length; i++) {
        const text = cells.eq(i).text().trim();
        if (text.includes('million') || text.match(/\b\d{5,}\b/)) {
          if (text.includes('million')) {
            const millionMatch = text.match(/([\d.]+)\s*million/);
            if (millionMatch) {
              visitors = Math.round(parseFloat(millionMatch[1]) * 1000000);
              break;
            }
          } else {
            const visitorMatch = text.replace(/,/g, '').match(/(\d+)/);
            if (visitorMatch) {
              visitors = parseInt(visitorMatch[1], 10);
              break;
            }
          }
        }
      }
      
      // Create park object
      parkNames.add(parkName);
      
      const park: InsertPark = {
        name: parkName,
        state: state || 'United States', // Default if state not found
        description: description,
        image: imageUrl || 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Logo_of_the_United_States_National_Park_Service.svg/240px-Logo_of_the_United_States_National_Park_Service.svg.png',
        visitors: visitors || 100000, // Fallback if visitors data is missing
        established: establishedYear || 1900, // Fallback if year not found
        size: size || 10000, // Fallback if size not found
        elo: 1500, // Starting ELO rating
      };
      
      // Add special tags to certain parks
      if (parkName === "Great Smoky Mountains") {
        park.tag = "Most Visited";
      } else if (parkName === "Yellowstone") {
        park.tag = "First National Park";
      } else if (visitors > 3000000) {
        park.tag = "Popular";
      }
      
      parks.push(park);
      
      // Debug output for each park found
      console.log(`Found park: ${parkName} (${state}, est. ${establishedYear})`);
    });
    
    // Verify we have parks
    if (parks.length < 10) {
      console.warn(`WARNING: Only found ${parks.length} parks, expected 63. Parsing may have failed.`);
    }
    
    console.log(`Fetched ${parks.length} unique parks from Wikipedia`);
    
    return parks;
    
  } catch (error) {
    console.error('Error fetching Wikipedia data:', error);
    
    // Return a minimal set of default parks if scraping fails
    return [
      {
        name: "Yellowstone",
        state: "Wyoming/Montana/Idaho",
        description: "World's first national park, known for geysers and diverse wildlife.",
        image: "https://upload.wikimedia.org/wikipedia/commons/5/58/Yellowstone_River_in_Hayden_Valley_07-10-09_114.jpg",
        visitors: 4115000,
        established: 1872,
        size: 2219791,
        tag: "First National Park",
        elo: 1500
      },
      {
        name: "Yosemite",
        state: "California",
        description: "Granite cliffs, waterfalls, giant sequoias, and diverse wildlife.",
        image: "https://upload.wikimedia.org/wikipedia/commons/d/de/Tunnel_View%2C_Yosemite_Valley%2C_Yosemite_NP_-_Diliff.jpg",
        visitors: 3667550,
        established: 1890,
        size: 759620,
        elo: 1500
      },
      {
        name: "Grand Canyon",
        state: "Arizona",
        description: "Immense canyon carved by the Colorado River, revealing billions of years of geological history.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Grand_Canyon_view_from_Pima_Point_2010.jpg/640px-Grand_Canyon_view_from_Pima_Point_2010.jpg",
        visitors: 4532677,
        established: 1919,
        size: 1201647,
        elo: 1500
      },
      {
        name: "Zion",
        state: "Utah",
        description: "Steep red cliffs, emerald pools, and waterfalls in a desert landscape.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Angels_Landing.jpg/640px-Angels_Landing.jpg",
        visitors: 4320033,
        established: 1919,
        size: 146597,
        elo: 1500
      },
      {
        name: "Acadia",
        state: "Maine",
        description: "Granite peaks, rocky shores, and spruce-fir forests on the Atlantic coast.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Bass_Harbor_Head_Light_Station_2016.jpg/640px-Bass_Harbor_Head_Light_Station_2016.jpg",
        visitors: 3537575,
        established: 1919,
        size: 49075,
        elo: 1500
      },
      {
        name: "Great Smoky Mountains",
        state: "Tennessee/North Carolina",
        description: "Ancient mountains with diverse forests, wildflowers, and abundant wildlife.",
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Foothills_Parkway_View.jpg/640px-Foothills_Parkway_View.jpg",
        visitors: 11421200,
        established: 1934,
        size: 522427,
        tag: "Most Visited",
        elo: 1500
      }
    ];
  }
}