import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_COMPANIES = [
  {
    id: 1,
    name: "TechNova Solutions",
    industry: "Software Development",
    location: "San Francisco, CA",
    description: "Leading provider of innovative software solutions for enterprise businesses.",
    logo: "https://ui-avatars.com/api/?name=TechNova&background=0D8ABC&color=fff",
    openPositions: 5,
  },
  {
    id: 2,
    name: "EcoLogistics",
    industry: "Supply Chain",
    location: "Seattle, WA",
    description: "Sustainable and eco-friendly logistics and supply chain management.",
    logo: "https://ui-avatars.com/api/?name=Eco&background=22C55E&color=fff",
    openPositions: 2,
  },
  {
    id: 3,
    name: "HealthCore",
    industry: "Healthcare Tech",
    location: "Boston, MA",
    description: "Modernizing healthcare through advanced data analytics and patient platforms.",
    logo: "https://ui-avatars.com/api/?name=Health&background=EF4444&color=fff",
    openPositions: 8,
  },
  {
    id: 4,
    name: "FinFlow",
    industry: "Financial Services",
    location: "New York, NY",
    description: "Disrupting traditional banking with seamless digital finance solutions.",
    logo: "https://ui-avatars.com/api/?name=FinFlow&background=F59E0B&color=fff",
    openPositions: 3,
  },
  {
    id: 5,
    name: "CreativePulse",
    industry: "Marketing & Design",
    location: "Austin, TX",
    description: "A full-service creative agency specializing in brand identity and digital marketing.",
    logo: "https://ui-avatars.com/api/?name=Creative&background=8B5CF6&color=fff",
    openPositions: 1,
  },
  {
    id: 6,
    name: "AeroDynamics",
    industry: "Aerospace",
    location: "Denver, CO",
    description: "Pioneering next-generation aerospace technologies and space exploration.",
    logo: "https://ui-avatars.com/api/?name=Aero&background=3B82F6&color=fff",
    openPositions: 12,
  }
];


export default function Companies() {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredCompanies = MOCK_COMPANIES.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Discover Companies</h1>
            <p className="text-gray-500 mt-1">Find and connect with top organizations looking for talent.</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search companies or industries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm"
            />
          </div>
        </div>

        {/* Companies Grid */}
        {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full"
              >
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={company.logo}
                    alt={`${company.name} logo`}
                    className="w-16 h-16 rounded-xl object-cover shadow-sm"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1 gap-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{company.industry}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1 gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{company.location}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm flex-grow line-clamp-3 mb-6">
                  {company.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                    {company.openPositions} {company.openPositions === 1 ? 'Open Position' : 'Open Positions'}
                  </span>

                  {/* Assuming there's a dynamic route for company details like /companies/:id */}
                  <Link
                    to={`/companies/${company.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1 -mr-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No companies found</h3>
            <p className="text-gray-500 mt-1">We couldn't find any companies matching your search.</p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}