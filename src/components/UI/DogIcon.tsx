import React from 'react'

interface DogIconProps {
  className?: string
  size?: number
}

const DogIcon: React.FC<DogIconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Dog head */}
      <circle cx="12" cy="10" r="8" fill="currentColor" />
      {/* Ears */}
      <ellipse cx="7" cy="6" rx="2" ry="4" fill="currentColor" />
      <ellipse cx="17" cy="6" rx="2" ry="4" fill="currentColor" />
      {/* Eyes */}
      <circle cx="9" cy="9" r="1.5" fill="white" />
      <circle cx="15" cy="9" r="1.5" fill="white" />
      {/* Nose */}
      <ellipse cx="12" cy="11" rx="1" ry="1.5" fill="white" />
      {/* Mouth */}
      <path
        d="M9 13 Q12 15 15 13"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

export default DogIcon

