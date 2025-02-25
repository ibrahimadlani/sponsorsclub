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