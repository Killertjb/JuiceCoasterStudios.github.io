/*
 * SITE CONFIG — the one place to edit site-wide details.
 *
 * To add a new artist / service to the home page:
 *   1. Copy Website/_template to Website/<YourName>  (see README.md)
 *   2. Add one entry to `listings` below.
 * The home page cards and filter buttons update automatically.
 *
 * Paths are relative to the site root (where index.html lives).
 */
window.SITE = {
  name: "Juice Coster Studio",
  tagline: "Where Creativity Meets Excellence",
  description: "Music Production | Artist Management | Print Services",

  // Used by the contact page and anywhere else contact details are shown.
  // TODO: replace the placeholders below with real details.
  contact: {
    email: "your@email.com",
    whatsappNumber: "27123456789",       // digits only, with country code (no + or spaces)
    whatsappDisplay: "+27 12 345 6789",
    instagram: "#",
    facebook: "#",
    tiktok: "#",
    youtube: "#"
  },

  // category: "Artist" or "Service" (drives the filter buttons on the home page)
  listings: [
    {
      id: "jcs-music",
      title: "Music Production",
      category: "Service",
      icon: "🎵",
      summary: "Professional recording, mixing, and mastering services for your next hit.",
      cta: "Learn More",
      url: "Website/JCS/Pages/home.html"
    },
    {
      id: "nhs",
      title: "NHS",
      category: "Artist",
      icon: "🎤",
      summary: "Discover the unique sound and style of our featured artist NHS.",
      cta: "View Profile",
      url: "Website/NHS/Pages/home.html"
    },
    {
      id: "moowit",
      title: "Moowit",
      category: "Artist",
      icon: "🎧",
      summary: "Experience the creative world of Moowit's music and artistry.",
      cta: "View Profile",
      url: "Website/Moowit/Pages/home.html"
    },
    {
      id: "ploeter",
      title: "Ploeter Printing",
      category: "Service",
      icon: "🖨️",
      summary: "High-quality printing services for all your creative and business needs.",
      cta: "View Services",
      url: "Website/Ploeter/Pages/home.html"
    }
  ]
};
