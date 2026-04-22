import React, { useState } from 'react';
import { Search, Building2, MapPin, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Mock data for the 3 example internships
const mockInternships = [
  {
    id: 1,
    title: "Software Engineering Intern",
    company: "Google",
    location: "Remote",
    type: "Full Time"
  },
  {
    id: 2,
    title: "Frontend Developer Intern",
    company: "Meta",
    location: "Onsite",
    type: "Part Time"
  },
  {
    id: 3,
    title: "Data Science Intern",
    company: "Amazon",
    location: "Hybrid",
    type: "Full Time"
  }
];

export default function Internships() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInternships = mockInternships.filter((internship) =>
    internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    internship.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      <div className="mb-12 space-y-4 flex flex-col items-center text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Explore Internships</h1>
        <p className="text-muted-foreground w-full max-w-xl">Find the best internship opportunities tailored for you.</p>

        {/* Search Bar with Icon */}
        <div className="relative mt-6 flex items-center w-full max-w-lg">
          <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by title or company..."
            className="pl-11 h-12 text-base rounded-full shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Internships List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredInternships.length > 0 ? (
          filteredInternships.map((internship) => (
            <div
              key={internship.id}
              className="border rounded-2xl bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group"
            >
              {/* Photo Placeholder */}
              <div className="w-full h-40 bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-b relative">
                {/* Decorative fade at bottom of image area */}
                <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/5 to-transparent"></div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                  <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">{internship.title}</h3>
                  <div className="flex items-center text-sm font-semibold text-primary/80 gap-1.5 mb-4">
                    <Building2 className="h-4 w-4" />
                    {internship.company}
                  </div>

                  <div className="flex flex-wrap items-center text-xs text-muted-foreground gap-3">
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                      <MapPin className="h-3.5 w-3.5" />
                      {internship.location}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                      <Briefcase className="h-3.5 w-3.5" />
                      {internship.type}
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-4 flex gap-2">
                  <Button className="w-full font-semibold rounded-xl">Apply Now</Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16 text-muted-foreground bg-muted/20 border border-dashed rounded-2xl">
            No internships found. Try a different search term.
          </div>
        )}
      </div>
    </div>
  );
}
