import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, MapPin, Briefcase, X, Filter, Share2, Heart, Calendar, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import api from '@/api/api';

export default function Internships() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  // Filter States
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedTech, setSelectedTech] = useState("");
  const navigate = useNavigate();
  const [likedItems, setLikedItems] = useState(new Set());

  const toggleLike = (id) => {
    setLikedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getInternshipStatusBadge = (status) => {
    switch (status) {
      case 'OPEN_FOR_APPLICATION': return 'success';
      case 'CLOSED_FOR_APPLICATION': return 'destructive';
      case 'ONGOING': return 'purple';
      case 'FINISHED': return 'info';
      default: return 'outline';
    }
  };

  const searchInputRef = useRef(null);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const res = await api.get('/internships/');

      const rawData = res.data.results || res.data;
      const mappedData = (Array.isArray(rawData) ? rawData : []).map(item => {
        let skills = [];
        if (item.internship_skills) {
          try {
            skills = JSON.parse(item.internship_skills);
            if (!Array.isArray(skills)) skills = [skills];
          } catch (e) {
            skills = [item.internship_skills];
          }
        }
        const formatDuration = (durationStr) => {
          if (!durationStr) return "Flexible";
          const parts = durationStr.split(' ');
          if (parts.length > 1) {
            const days = parts[0];
            return `${days} ${parseInt(days) === 1 ? 'day' : 'days'}`;
          }
          const timeParts = durationStr.split(':');
          if (timeParts.length >= 2) {
            const hours = parseInt(timeParts[0]);
            if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
            return `${parseInt(timeParts[1])} mins`;
          }
          return durationStr;
        };

        return {
          ...item,
          company_name: item.company_name || `Company #${item.company}`,
          wilaya: item.wilaya || item.internship_location,
          required_skills: skills,
          tech: skills,
          banner_image: item.internship_image || null,
          type: item.internship_type || "N/A",
          internship_duration: formatDuration(item.internship_duration)
        };
      });

      setInternships(mappedData);
    } catch (err) {
      console.error("Error fetching internships:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  // Safe data processing
  const safeInternships = Array.isArray(internships) ? internships : [];

  // Extracted unique filter options with safety
  const allWilayas = [...new Set(safeInternships.map(i => i.wilaya).filter(Boolean))];
  const allTypes = [...new Set(safeInternships.map(i => i.internship_type).filter(Boolean))];
  const allTechs = [...new Set(safeInternships.flatMap(i => i.required_skills || []).filter(Boolean))];

  // Close search on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchActive(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredInternships = safeInternships.filter((internship) => {
    const title = internship.title?.toLowerCase() || "";
    const company = internship.company_name?.toLowerCase() || "";

    const matchesSearch = title.includes(searchQuery.toLowerCase()) || company.includes(searchQuery.toLowerCase());
    const matchesWilaya = selectedWilaya === "" || internship.wilaya === selectedWilaya;
    const matchesType = selectedType === "" || internship.internship_type === selectedType;
    const matchesTech = selectedTech === "" || (internship.required_skills && internship.required_skills.includes(selectedTech));

    return matchesSearch && matchesWilaya && matchesType && matchesTech;
  });

  const clearFilters = () => {
    setSelectedWilaya("");
    setSelectedType("");
    setSelectedTech("");
  };

  const hasActiveFilters = selectedWilaya !== "" || selectedType !== "" || selectedTech !== "";

  return (
    <div className="container mx-auto pt-6 pb-12 px-4 max-w-6xl relative min-h-[80vh]">

      {/* Simple Background Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-background/80  ${isSearchActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => {
          setIsSearchActive(false);
          setSearchQuery("");
          clearFilters();
        }}
      />

      <div className={`space-y-4 flex flex-col items-center text-center  ${isSearchActive ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 mb-8'
        }`}>
        <div className="flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Explore Internships</h1>
          <p className="text-muted-foreground w-full max-w-xl mt-3">Find the best internship opportunities tailored for you.</p>
        </div>
      </div>

      {/* Unified Search Section: Simple positioning */}
      <div
        className={`relative flex flex-col items-center w-full  ${isSearchActive
          ? 'max-w-4xl fixed top-8 left-1/2 -translate-x-1/2 px-4 z-50 max-h-[85vh] overflow-hidden'
          : 'max-w-lg mt-2 mx-auto z-10'
          }`}
      >
        {/* Search Input */}
        <div className="relative w-full flex items-center shrink-0">
          <Search className={`absolute text-muted-foreground  z-10 ${isSearchActive ? 'left-6 h-6 w-6' : 'left-4 h-5 w-5'}`} />
          <Input
            ref={searchInputRef}
            placeholder="Search by title, company, or keywords..."
            className={`transition-all duration-500 ease-in-out w-full bg-background relative z-0 ${isSearchActive
              ? 'pl-16 pr-14 h-16 text-lg lg:text-xl shadow-2xl rounded-2xl border-primary/30 focus-visible:border-primary focus-visible:ring-primary/20 hover:border-primary/50'
              : 'pl-11 h-12 text-base rounded-full shadow-sm hover:shadow-md'
              }`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchActive(true)}
          />
          {isSearchActive && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors h-10 w-10 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery("");
                if (searchQuery === "" && !hasActiveFilters) {
                  setIsSearchActive(false);
                }
                searchInputRef.current?.focus();
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Filters Row */}
        {isSearchActive && (
          <div className="w-full flex flex-wrap items-center gap-3 mt-4 animate-in fade-in slide-in-from-top-4 duration-500 bg-card p-3 rounded-2xl shadow-lg border shrink-0">
            <div className="flex items-center gap-2 px-2 text-sm font-semibold text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filters:
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-muted text-foreground text-sm font-medium rounded-xl px-4 py-2.5 border-0 focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-muted/80 transition-colors appearance-none outline-none min-w-[140px] shadow-sm"
            >
              <option value="">By Type (All)</option>
              {allTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Tech Filter */}
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="bg-muted text-foreground text-sm font-medium rounded-xl px-4 py-2.5 border-0 focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-muted/80 transition-colors appearance-none outline-none min-w-[140px] shadow-sm"
            >
              <option value="">By Tech (All)</option>
              {allTechs.map(tech => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>

            {/* Wilaya Filter */}
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="bg-muted text-foreground text-sm font-medium rounded-xl px-4 py-2.5 border-0 focus:ring-2 focus:ring-primary/20 cursor-pointer hover:bg-muted/80 transition-colors appearance-none outline-none min-w-[140px] shadow-sm"
            >
              <option value="">By Wilaya (All)</option>
              {allWilayas.map(wilaya => (
                <option key={wilaya} value={wilaya}>{wilaya}</option>
              ))}
            </select>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-sm font-bold text-destructive hover:bg-destructive/10 rounded-lg px-3 py-2 flex items-center gap-1.5 transition-colors"
              >
                <X className="h-4 w-4" /> Clear All
              </button>
            )}
          </div>
        )}

        {/* Interactive Search Overlay Results (Moved inside the main container!) */}
        {isSearchActive && (
          <div className="w-full mt-4 animate-in fade-in slide-in-from-top-4 duration-500 flex-1 overflow-hidden flex flex-col">
            <div className="bg-card text-card-foreground border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-full">
              <div className="overflow-y-auto p-4 space-y-2 relative custom-scrollbar">
                {searchQuery.trim() === "" && !hasActiveFilters ? (
                  <div className="py-20 px-10 flex flex-col items-center justify-center text-center text-muted-foreground space-y-4">
                    <Search className="h-12 w-12 opacity-20 mb-4" />
                    <p className="text-xl font-medium">Type anything or select a filter to start searching...</p>
                    <p className="text-sm">Try searching for &quot;Software&quot;, &quot;Google&quot;, or filter by Tech!</p>
                  </div>
                ) : filteredInternships.length > 0 ? (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="px-4 py-2 pt-0 pb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      {filteredInternships.length} Results Found
                      {hasActiveFilters && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase font-bold">Filtered</span>}
                    </h3>
                    {filteredInternships.map((internship, index) => (
                      <div
                        key={internship.id}
                        className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-muted/60 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-border/50"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="h-14 w-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Briefcase className="h-7 w-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">{internship.title}</h4>
                          <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-x-4 gap-y-2 mt-1">
                            <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4 shrink-0" />{internship.company}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 shrink-0" />{internship.wilaya}</span>
                            <span className="flex items-center gap-1.5 bg-muted px-2 py-0.5 rounded-md text-xs font-medium text-foreground"><Briefcase className="h-3 w-3 shrink-0" />{internship.type}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {internship.tech.map(t => (
                              <span key={t} className="text-[10px] uppercase font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button variant="default" className="shrink-0 rounded-xl sm:opacity-0 sm:group-hover:opacity-100 transition-opacity mt-4 sm:mt-0">
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4">
                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                      <X className="h-6 w-6 opacity-50" />
                    </div>
                    <p className="text-lg">No internships found matching your criteria</p>
                    <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">Clear Filters</Button>
                  </div>
                )}
              </div>

              <div className="bg-muted px-6 py-4 border-t text-sm text-muted-foreground flex items-center justify-between shrink-0">
                <span>Press <kbd className="bg-background px-2 py-1 rounded-md border text-xs font-semibold shadow-sm ml-1 hidden sm:inline-block">ESC</kbd> to close</span>
                <span>Search results powered by advanced filtering</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Internships List - Normal View */}
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-6 ${isSearchActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
      >
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-[350px] w-full rounded-2xl bg-muted" />
          ))
        ) : filteredInternships.length > 0 ? (
          filteredInternships.map((internship) => (
            <div
              key={internship.id}
              className="border rounded-2xl bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group"
            >
              {/* Photo Placeholder / Banner */}
              <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-b relative overflow-hidden">
                {internship.banner_image ? (
                  <img src={internship.banner_image} className="w-full h-full object-cover" alt="Banner" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/20 dark:from-black/50 to-transparent"></div>
                  </>
                )}
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-xl leading-tight line-clamp-2">{internship.title}</h3>
                    <Badge variant={getInternshipStatusBadge(internship.status)} className="capitalize whitespace-nowrap mt-1">
                      {internship.status ? internship.status.replace(/_/g, ' ').toLowerCase() : 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm font-semibold text-primary/80 gap-1.5 mb-3">
                    <Building2 className="h-4 w-4" />
                    {internship.company_name || "Company"} - {internship.wilaya || "N/A"}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {(internship.required_skills || []).slice(0, 3).map(t => (
                      <span key={t} className="text-[10px] uppercase font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">
                        {t}
                      </span>
                    ))}
                    {internship.required_skills?.length > 3 && (
                      <span className="text-[10px] uppercase font-bold bg-primary/10 text-primary px-2 py-1 rounded-md">
                        +{internship.required_skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-4 flex gap-2 border-t items-center">
                  <Button
                    variant="outline"
                    className="flex-1 font-bold rounded-xl hover:bg-primary hover:text-white transition-all duration-300"
                    onClick={() => navigate(`/internships/${internship.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-12 w-12 rounded-xl transition-all duration-300 hover:bg-transparent ${likedItems.has(internship.id) ? 'text-destructive' : 'hover:text-destructive'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(internship.id);
                    }}
                  >
                    <Heart className={`h-6 w-6 ${likedItems.has(internship.id) ? 'fill-destructive text-destructive' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-xl hover:text-primary hover:bg-transparent transition-all duration-300"
                  >
                    <Share2 className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-6">
              <Search className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">No internships found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              We couldn't find anything matching your current filters. Try adjusting them or clear your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
