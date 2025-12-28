import React from 'react'
import { Link } from 'react-router-dom'

interface ToolCardProps {
  title: string
  description: string
  path: string
  icon: React.ReactNode
}

const ToolCard: React.FC<ToolCardProps> = ({ title, description, path, icon }) => {
  return (
    <Link
      to={path}
      className="block bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-100 hover:border-orange-primary group"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-primary flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  )
}

export default ToolCard

