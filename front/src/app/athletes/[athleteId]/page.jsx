"use client";

import React from 'react'
import { useParams } from 'next/navigation'

const AthletePage = () => {
  const { 'athleteId': athleteId } = useParams();
  return (
    <div>
      <p>Athlete ID: {athleteId}</p>
    </div>
  )
}

export default AthletePage
