import catSilk from "../assets/category-silk.png";
import catWedding from "../assets/category-wedding.png";
import { JEWELLERY_CATEGORY } from "./catalog";

const jewelleryPlaceholder =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#28170f" />
          <stop offset="50%" stop-color="#7a4b27" />
          <stop offset="100%" stop-color="#e0b15d" />
        </linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#bg)" />
      <circle cx="250" cy="270" r="130" fill="rgba(255,255,255,0.10)" />
      <circle cx="560" cy="720" r="180" fill="rgba(255,255,255,0.08)" />
      <g fill="none" stroke="#fff3d4" stroke-width="18" stroke-linecap="round">
        <path d="M250 235c0-72 58-130 130-130s130 58 130 130c0 80-63 139-130 244-67-105-130-164-130-244z" opacity="0.88" />
        <path d="M400 360v98" opacity="0.85" />
        <path d="M335 300h130" opacity="0.85" />
      </g>
      <text x="50%" y="86%" text-anchor="middle" font-family="Georgia, serif" font-size="54" letter-spacing="8" fill="#fff6e4">IMITATION</text>
      <text x="50%" y="92%" text-anchor="middle" font-family="Georgia, serif" font-size="54" letter-spacing="8" fill="#fff6e4">JEWELLERY</text>
    </svg>
  `);

export const getHomeCategories = (jewelleryImage) => [
  { name: "Silk", img: catSilk, slug: "Silk" },
  { name: "Wedding Sarees", img: catWedding, slug: "Wedding Sarees" },
  { name: "Cotton", img: catSilk, slug: "Cotton" },
  { name: "Paithani", img: catWedding, slug: "Paithani" },
  {
    name: JEWELLERY_CATEGORY,
    img: jewelleryImage || jewelleryPlaceholder,
    slug: JEWELLERY_CATEGORY
  }
];
