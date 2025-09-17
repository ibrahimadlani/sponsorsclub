import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const handleScroll = (setIsHidden, lastScrollY, setLastScrollY) => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > lastScrollY && currentScrollY > 50) {
    setIsHidden(true); // Hide footer on scroll down
  } else {
    setIsHidden(false); // Show footer on scroll up
  }

  setLastScrollY(currentScrollY);
};

export const handleNavBarScroll = (setIsHidden, lastScrollY, setLastScrollY) => {
  const currentScrollY = window.scrollY;

  if (currentScrollY < lastScrollY) {
    setIsHidden(true); // Show navbar when scrolling up
  } else {
    setIsHidden(false); // Hide navbar when scrolling down
  }

  setLastScrollY(currentScrollY);
};

export function formatNumber(num) {
  if (num < 0) return "0"; // Sécurité pour éviter les nombres négatifs
  
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(".0", "") + "B"; // Milliards
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(".0", "") + "M"; // Millions
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(".0", "") + "k"; // Milliers
  }
  
  return num.toString(); // Retourne le nombre tel quel si < 1000
}

// Format a price in EUR like "50 000€" (no decimals, thin space thousands)
export function formatPriceEUR(value) {
  if (value == null) return "0€";
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/\s|€/g, ''));
  if (Number.isNaN(num)) return `${value}€`;
  const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(num);
  return `${formatted}€`;
}
