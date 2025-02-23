import Image from "next/image";

/**
 * Home Component
 *
 * This component serves as the homepage layout.
 * It uses a CSS grid to structure the page into three rows:
 * a header spacer (20px), the main content area (flexible), and a footer spacer (20px).
 * The grid is centered both vertically and horizontally.
 *
 * Tailwind CSS is used for styling, including a custom font variable.
 *
 * @returns {JSX.Element} The rendered homepage.
 */
export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Main content area */}
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {/* Add your main content here */}
      </main>
      
      {/* Footer section */}
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        {/* Add your footer content here */}
      </footer>
    </div>
  );
}