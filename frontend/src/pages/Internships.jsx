import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Building2, MapPin, Briefcase, X, Filter, Share2, Heart, Calendar, Users, Check, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import api from '@/api/api';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useLanguage } from '@/components/language-provider';

export default function Internships() {
  const { t } = useLanguage();
  const location = useLocation();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  // `searchQuery` is what the user is currently typing.
  // `submittedSearchQuery` is the query that is actually applied to filtering (set on Enter).
  const [searchQuery, setSearchQuery] = useState(location.state?.searchQuery || "");
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState(location.state?.searchQuery || "");
  const [isSearchActive, setIsSearchActive] = useState(location.state?.isSearchActive || false);

  // Filter States
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  
  // Popover Open States
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isWilayaOpen, setIsWilayaOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
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

  const ALGERIAN_WILAYAS = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
    "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers", "Djelfa", "Jijel", "Sétif", "Saïda",
    "Skikda", "Sidi Bel Abbès", "Annabba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla",
    "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
    "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar",
    "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam", "Touggourt", "Djanet", "M'Ghair", "El Meniaa"
  ];

  const COMMON_SKILLS = [
    "React", "Node.js", "Python", "UI/UX Design", "Marketing",
    "Data Science", "Java", "C++", "SQL", "Graphic Design",
    "Project Management", "Social Media", "SEO", "Excel",
    "JavaScript", "TypeScript", "HTML/CSS", "PHP", "Laravel",
    "Swift", "Kotlin", "Android", "iOS", "Flutter",
    "AWS", "Docker", "Kubernetes", "DevOps", "Cybersecurity",
    "Machine Learning", "Artificial Intelligence", "Blockchain",
    "Financial Analysis", "Business Strategy", "Content Writing",
    "Copywriting", "Video Editing", "Adobe Photoshop", "Adobe Illustrator",
    "Figma", "Canva", "Sales", "Customer Support", "HR Management"
  ];

  // Extracted unique filter options with safety
  const allWilayas = ALGERIAN_WILAYAS;
  const allTypes = ["FULL_TIME", "PART_TIME"];
  const allLocations = ["REMOTE", "ONSITE", "HYBRID"];
  const allSkills = COMMON_SKILLS;

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

    const q = (submittedSearchQuery || "").toLowerCase();
    const matchesSearch = q === "" || title.includes(q) || company.includes(q);
    const matchesWilaya = selectedWilaya === "" || internship.wilaya === selectedWilaya;
    const matchesType = selectedType === "" || internship.internship_type === selectedType;
    const matchesLocation = selectedLocation === "" || internship.internship_location === selectedLocation;
    const matchesSkill = selectedSkills.length === 0 || (internship.required_skills && selectedSkills.some(s => internship.required_skills.includes(s)));

    return matchesSearch && matchesWilaya && matchesType && matchesLocation && matchesSkill;
  });

  const clearFilters = () => {
    setSelectedWilaya("");
    setSelectedType("");
    setSelectedLocation("");
    setSelectedSkills([]);
  };

  const hasActiveFilters = selectedWilaya !== "" || selectedType !== "" || selectedLocation !== "" || selectedSkills.length > 0;

  return (
    <div className="container mx-auto pt-6 pb-12 px-4 max-w-6xl relative min-h-[80vh]">

      {/* Simple Background Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-background/80  ${isSearchActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => {
          setIsSearchActive(false);
          setSearchQuery("");
          setSubmittedSearchQuery("");
          clearFilters();
        }}
      />

      <div className={`space-y-4 flex flex-col items-center text-center  ${isSearchActive ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 mb-8'
        }`}>
        <div className="flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("exploreInternships")}</h1>
          <p className="text-muted-foreground w-full max-w-xl mt-3">{t("exploreInternshipsDesc")}</p>
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
            placeholder={t("searchInternships")}
            className={`transition-all duration-500 ease-in-out w-full bg-background relative z-0 ${isSearchActive
              ? 'pl-16 pr-14 h-16 text-lg lg:text-xl shadow-2xl rounded-2xl border-primary/30 focus-visible:border-primary focus-visible:ring-primary/20 hover:border-primary/50'
              : 'pl-11 h-12 text-base rounded-full shadow-sm hover:shadow-md'
              }`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchActive(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSubmittedSearchQuery(searchQuery.trim());
              }
            }}
          />
          {isSearchActive && (
            <Button
              variant="ghost"
              size="icon"
              className={`absolute z-10 rounded-full transition-colors h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 ${isSearchActive ? 'right-4' : 'right-3'}`}
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery("");
                setSubmittedSearchQuery("");
                clearFilters();
                if (!hasActiveFilters) {
                  setIsSearchActive(false);
                  searchInputRef.current?.blur();
                } else {
                  searchInputRef.current?.focus();
                }
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
              {t("filters")}
            </div>

            {/* Skill Filter (Custom Multi-select with Checkmarks) */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-muted hover:bg-muted/80 text-foreground border-0 rounded-xl px-4 py-2.5 h-10 font-medium flex items-center gap-2 w-[150px] justify-between shadow-sm"
                >
                  <span className="truncate text-xs">
                    {selectedSkills.length === 0 
                      ? t("bySkillAll") 
                      : `${selectedSkills.length} ${t("skillsSelected")}`}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1.5 rounded-xl shadow-2xl border-border bg-card" align="start">
                <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-0.5">
                  {allSkills.map(skill => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                          isSelected 
                            ? "bg-primary/10 text-primary font-semibold" 
                            : "hover:bg-muted text-foreground"
                        )}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedSkills(selectedSkills.filter(s => s !== skill));
                          } else {
                            setSelectedSkills([...selectedSkills, skill]);
                          }
                        }}
                      >
                        {skill}
                        {isSelected && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
                {selectedSkills.length > 0 && (
                  <div className="pt-2 mt-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs text-destructive hover:bg-destructive/10 rounded-lg"
                      onClick={() => setSelectedSkills([])}
                    >
                      {t("clearSkills")}
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            {/* Type Filter */}
            <Popover open={isTypeOpen} onOpenChange={setIsTypeOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-muted hover:bg-muted/80 text-foreground border-0 rounded-xl px-4 py-2.5 h-10 font-medium flex items-center gap-2 w-[150px] justify-between shadow-sm"
                >
                  <span className="truncate text-xs">
                    {selectedType === "" 
                      ? t("byTypeAll") 
                      : selectedType.replace('_', ' ')}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1.5 rounded-xl shadow-2xl border-border bg-card" align="start">
                <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-0.5">
                  <button
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left",
                      selectedType === "" ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground"
                    )}
                    onClick={() => {
                      setSelectedType("");
                      setIsTypeOpen(false);
                    }}
                  >
                    {t("byTypeAll")}
                    {selectedType === "" && <Check className="h-4 w-4" />}
                  </button>
                  {allTypes.map(type => {
                    const isSelected = selectedType === type;
                    return (
                      <button
                        key={type}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left",
                          isSelected 
                            ? "bg-primary/10 text-primary font-semibold" 
                            : "hover:bg-muted text-foreground"
                        )}
                        onClick={() => {
                          setSelectedType(isSelected ? "" : type);
                          setIsTypeOpen(false);
                        }}
                      >
                        {type.replace('_', ' ')}
                        {isSelected && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {/* Location Type Filter */}
            <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-muted hover:bg-muted/80 text-foreground border-0 rounded-xl px-4 py-2.5 h-10 font-medium flex items-center gap-2 w-[150px] justify-between shadow-sm"
                >
                  <span className="truncate text-xs">
                    {selectedLocation === "" 
                      ? t("byLocationAll") 
                      : selectedLocation}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1.5 rounded-xl shadow-2xl border-border bg-card" align="start">
                <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-0.5">
                  <button
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left",
                      selectedLocation === "" ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground"
                    )}
                    onClick={() => {
                      setSelectedLocation("");
                      setIsLocationOpen(false);
                    }}
                  >
                    {t("byLocationAll")}
                    {selectedLocation === "" && <Check className="h-4 w-4" />}
                  </button>
                  {allLocations.map(loc => {
                    const isSelected = selectedLocation === loc;
                    return (
                      <button
                        key={loc}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left",
                          isSelected 
                            ? "bg-primary/10 text-primary font-semibold" 
                            : "hover:bg-muted text-foreground"
                        )}
                        onClick={() => {
                          setSelectedLocation(isSelected ? "" : loc);
                          setIsLocationOpen(false);
                        }}
                      >
                        {loc}
                        {isSelected && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {/* Wilaya Filter */}
            <Popover open={isWilayaOpen} onOpenChange={setIsWilayaOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="bg-muted hover:bg-muted/80 text-foreground border-0 rounded-xl px-4 py-2.5 h-10 font-medium flex items-center gap-2 w-[150px] justify-between shadow-sm"
                >
                  <span className="truncate text-xs">
                    {selectedWilaya === "" 
                      ? t("byWilayaAll") 
                      : selectedWilaya}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1.5 rounded-xl shadow-2xl border-border bg-card" align="start">
                <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-0.5">
                  <button
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left",
                      selectedWilaya === "" ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground"
                    )}
                    onClick={() => {
                      setSelectedWilaya("");
                      setIsWilayaOpen(false);
                    }}
                  >
                    {t("byWilayaAll")}
                    {selectedWilaya === "" && <Check className="h-4 w-4" />}
                  </button>
                  {allWilayas.map(wilaya => {
                    const isSelected = selectedWilaya === wilaya;
                    return (
                      <button
                        key={wilaya}
                        className={cn(
                          "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left",
                          isSelected 
                            ? "bg-primary/10 text-primary font-semibold" 
                            : "hover:bg-muted text-foreground"
                        )}
                        onClick={() => {
                          setSelectedWilaya(isSelected ? "" : wilaya);
                          setIsWilayaOpen(false);
                        }}
                      >
                        {wilaya}
                        {isSelected && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {/* Clear Filters Button */}
          </div>
        )}


        {/* Interactive Search Overlay Results (Moved inside the main container!) */}
        {isSearchActive && (
          <div className="w-full mt-4 animate-in fade-in slide-in-from-top-4 duration-500 flex-1 overflow-hidden flex flex-col min-h-[60vh]">
            <div className="bg-card text-card-foreground border rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[70vh] max-h-full">
              <div className="flex-1 overflow-y-auto p-4 space-y-2 relative custom-scrollbar">
                {submittedSearchQuery.trim() === "" && !hasActiveFilters ? (
                  <div className="py-20 px-10 flex flex-col items-center justify-center text-center text-muted-foreground space-y-4">
                    <Search className="h-12 w-12 opacity-20 mb-4" />
                    <p className="text-xl font-medium">
                      {searchQuery.trim() !== ""
                        ? t("pressEnterToSearch")
                        : t("typeAnything")}
                    </p>
                    <p className="text-sm">
                      {searchQuery.trim() !== ""
                        ? t("youCanRefine")
                        : t("trySearchingFor")}
                    </p>
                  </div>
                ) : filteredInternships.length > 0 ? (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="px-4 py-2 pt-0 pb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      {filteredInternships.length} {t("resultsFound")}
                      {hasActiveFilters && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase font-bold">{t("filtered")}</span>}
                    </h3>
                    {filteredInternships.map((internship, index) => (
                      <div
                        key={internship.id}
                        className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-muted/60 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-border/50"
                        style={{ animationDelay: `${index * 50}ms` }}
                        onClick={() => navigate(`/internships/${internship.id}`, {
                          state: { searchQuery: submittedSearchQuery, isSearchActive, selectedWilaya, selectedType, selectedSkills }
                        })}
                      >
                        <div className="h-14 w-14 rounded-xl shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                          {internship.banner_image ? (
                            <img src={internship.banner_image} alt={internship.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-primary/10 text-primary flex items-center justify-center">
                              <Briefcase className="h-7 w-7" />
                            </div>
                          )}
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
                          {t("viewDetails")}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-4">
                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                      <X className="h-6 w-6 opacity-50" />
                    </div>
                    <p className="text-lg">{t("noInternshipsCriteria")}</p>
                  </div>
                )}
              </div>

              <div className="bg-muted px-6 py-4 border-t text-sm text-muted-foreground flex items-center justify-between shrink-0">
                <span>{t("pressToClose").split("ESC")[0]}<kbd className="bg-background px-2 py-1 rounded-md border text-xs font-semibold shadow-sm ml-1 hidden sm:inline-block">ESC</kbd>{t("pressToClose").split("ESC")[1]}</span>
                <span>{t("searchResultsAdvanced")}</span>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/internships/${internship.id}`, {
                          state: { searchQuery: submittedSearchQuery, isSearchActive, selectedWilaya, selectedType, selectedSkills }
                      });
                    }}
                  >
                    {t("viewDetails")}
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
            <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">{t("noInternshipsFound")}</h3>
            <p className="text-muted-foreground max-w-xs mx-auto">
              {t("couldntFindInternships")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
