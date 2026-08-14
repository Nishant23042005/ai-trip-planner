export function getDestinationImage(destination: string): string {
  const destLower = destination.toLowerCase();
  if (destLower.includes("paris")) {
    return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80";
  }
  if (destLower.includes("tokyo")) {
    return "https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=1200&q=80";
  }
  if (destLower.includes("london")) {
    return "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80";
  }
  if (destLower.includes("rome")) {
    return "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80";
  }
  if (destLower.includes("kyoto")) {
    return "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80";
  }
  if (destLower.includes("new york") || destLower.includes("nyc")) {
    return "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80";
  }
  if (destLower.includes("delhi")) {
    return "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80";
  }
  if (destLower.includes("mumbai")) {
    return "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80";
  }
  if (destLower.includes("sydney")) {
    return "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80";
  }
  if (destLower.includes("singapore")) {
    return "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80";
  }
  
  return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80";
}
