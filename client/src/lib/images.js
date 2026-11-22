// Site photography. The seven page images, the logo and the icon are YOUR provided files
// (client/public/images and client/public/brand). Only the dish / chef / kitchen shots
// below still use the original remote photos, because no replacement was provided.
// To swap any of them, drop a file into client/public/images/ and point to "/images/<file>".
const u = (id, w = 1800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export const IMG = {
  // ── provided images ──
  hero: '/images/home.webp',
  story: '/images/story.webp',
  dining: '/images/dining.webp',
  gallery: '/images/gallery.webp',
  private: '/images/private.webp',
  reservations: '/images/reservations.webp',
  contact: '/images/contact.webp',

  // ── remote placeholders (no provided image for these) ──
  chef: u('photo-1577219491135-ce391730fb2c', 1200),
  duck: u('photo-1518983546435-9a2f2b0c4a55', 1400),
  dumplings: u('photo-1563245372-f21724e3856d', 1400),
  prawns: u('photo-1565557623262-b51c2513a641', 1400),
};

// Smaller copies for phones (same photo, just fewer pixels to download).
export const SRCSET = {
  [IMG.hero]: '/images/home-960.webp 960w, /images/home.webp 1200w',
  [IMG.dining]: '/images/dining-960.webp 960w, /images/dining.webp 1280w',
  [IMG.private]: '/images/private-960.webp 960w, /images/private.webp 1920w',
};

// Art direction: where each photo is anchored when it is cropped.
// [desktop, mobile] values for CSS object-position, so the important part stays visible.
export const FOCUS = {
  [IMG.hero]: ['50% 50%', '42% 50%'],          // lantern-lit room; round table sits centre-right
  [IMG.story]: ['50% 45%', '50% 50%'],         // shopfront sign and doorway
  [IMG.dining]: ['50% 55%', '42% 50%'],        // red banquette + mirrors
  [IMG.gallery]: ['50% 28%', '50% 35%'],       // lanterns at the top of the portrait
  [IMG.private]: ['50% 20%', '50% 15%'],       // big lanterns along the ceiling
  [IMG.reservations]: ['50% 30%', '50% 30%'],  // lantern + blossom arch
  [IMG.contact]: ['72% 50%', '78% 50%'],       // plate, bowl and red fans on the right
};
