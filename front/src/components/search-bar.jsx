"use client";

import { useState } from "react";

/**
 * SearchBar Component
 *
 * Renders a search bar with inputs for destination, check-in date, check-out date,
 * and number of guests. Users can enter their travel details and click the search button.
 *
 * @returns {JSX.Element} The rendered search bar component.
 */
export default function SearchBar() {
  // State hooks for managing user inputs
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-4 rounded-3xl shadow-lg border border-gray-200 flex flex-col md:flex-row items-center gap-4">
      {/* Destination Input */}
      <div className="flex flex-col w-full md:w-1/4">
        <label
          htmlFor="destination"
          className="text-sm font-medium text-gray-700"
        >
          Destination
        </label>
        <input
          type="text"
          id="destination"
          placeholder="Where to?"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring focus:ring-gray-400 focus:border-gray-500 transition"
        />
      </div>

      {/* Check-in Date */}
      <div className="flex flex-col w-full md:w-1/4">
        <label htmlFor="checkIn" className="text-sm font-medium text-gray-700">
          Check-in
        </label>
        <input
          type="date"
          id="checkIn"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring focus:ring-gray-400 focus:border-gray-500 transition"
        />
      </div>

      {/* Check-out Date */}
      <div className="flex flex-col w-full md:w-1/4">
        <label htmlFor="checkOut" className="text-sm font-medium text-gray-700">
          Check-out
        </label>
        <input
          type="date"
          id="checkOut"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring focus:ring-gray-400 focus:border-gray-500 transition"
        />
      </div>

      {/* Guests Selector */}
      <div className="flex flex-col w-full md:w-1/4">
        <label htmlFor="guests" className="text-sm font-medium text-gray-700">
          Guests
        </label>
        <select
          id="guests"
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:ring focus:ring-gray-400 focus:border-gray-500 transition"
        >
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <option key={num} value={num}>
              {num} {num === 1 ? "Guest" : "Guests"}
            </option>
          ))}
        </select>
      </div>

      {/* Search Button */}
      <button className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition flex items-center gap-2">
        {/* Search Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        Search
      </button>
    </div>
  );
}