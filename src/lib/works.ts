export type Work = {
  name: string;
  domain: string;
  url: string;
  category: string;
  desc: string;
  image: string;
  featured?: boolean;
};

export const WORKS: Work[] = [
  {
    name: "Four Wheels Zone",
    domain: "fourwheelszone.com",
    url: "https://fourwheelszone.com",
    category: "Auto Services · Business Website",
    desc: "Auto repair and full mechanical care shop in Tagburos, Puerto Princesa — services, vehicles, and online booking in one site.",
    image: "/works/fourwheelszone.webp",
    featured: true,
  },
  {
    name: "Travel Wise Palawan",
    domain: "travelwisepalawan.com",
    url: "https://travelwisepalawan.com",
    category: "Travel & Tours",
    desc: "Tour packages and travel services for Palawan, with curated trips and easy inquiries for travelers.",
    image: "/works/travelwisepalawan.webp",
  },
  {
    name: "Two Wheels Zone",
    domain: "twowheelszone.com",
    url: "https://twowheelszone.com",
    category: "Motorcycle · E-commerce",
    desc: "Motorcycle parts, servicing, branch locator, and an online shop with franchise information.",
    image: "/works/twowheelszone.webp",
  },
];
