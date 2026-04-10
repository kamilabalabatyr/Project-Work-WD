/**
 * Curated list of Unsplash photo IDs for rental property listings.
 * Covers hotels, villas, cottages, cabins, apartments, and beach houses.
 *
 * Using property.id % array.length ensures the same property always gets
 * the same photo without storing anything in the database.
 */
const PROPERTY_PHOTO_IDS: string[] = [
  '1566073771259-6a8506099945', // hotel with pool
  '1582719478250-c89cae4dc85b', // resort terrace
  '1571896349842-33c89424de2d', // hotel exterior
  '1520250497591-112f2f40a3f4', // rooftop pool hotel
  '1542314831-068cd1dbfeeb',    // grand hotel facade
  '1551882547-ff40c63fe2f5',    // luxury hotel room
  '1590490360182-c33d57733427', // minimalist hotel room
  '1568084680786-a84f91d1153c', // boutique hotel lobby
  '1613977257363-707ba9348227', // modern villa
  '1600596542815-ffad4c1539a9', // villa with garden
  '1600607687939-ce8a6c25118c', // contemporary house exterior
  '1512917774080-9991f1c4c750', // sleek modern house
  '1510798831971-661eb04b3739', // wooden cabin
  '1464822759023-fed622ff2c3b', // mountain cabin snow
  '1449158743715-0a90ebb6d2d8', // cozy forest cabin
  '1476514525535-07fb3b4ae5f1', // lakeside house
  '1499793983690-e29da59ef1c2', // beachfront property
  '1522708323590-d24dbb6b0267', // apartment interior
  '1598928506311-c55ded91a20c', // city apartment building
  '1601918774516-2c05ead7c0fe', // scandinavian apartment
];

export function getPropertyImageUrl(propertyId: number, width: number, height: number): string {
  const photoId = PROPERTY_PHOTO_IDS[propertyId % PROPERTY_PHOTO_IDS.length];
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&h=${height}&fit=crop&auto=format&q=80`;
}
