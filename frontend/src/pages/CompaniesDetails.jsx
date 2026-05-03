import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, Award, Briefcase, Building2, Calendar, ChevronLeft, ExternalLink, Globe, Heart, Mail, MapPin, Share2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import api from '@/api/api';
import { useLanguage } from '@/components/language-provider';

// Using the same mock data as in Companies.jsx
const MOCK_COMPANIES = [
  {
    id: 1,
    name: "TechNova Solutions",
    industry: "Software Development",
    location: "San Francisco, CA",
    description: "Leading provider of innovative software solutions for enterprise businesses. TechNova Solutions focuses on delivering cutting-edge digital transformation services to help businesses scale seamlessly. With over 10 years of experience, we specialize in cloud computing, AI, and enterprise resource planning.",
    logo: "https://ui-avatars.com/api/?name=TechNova&background=0D8ABC&color=fff",
    openPositions: 5,
    website: "https://technova.example.com",
    foundedYear: 2012,
    size: "50-200 Employees",
    benefits: ["Health Insurance", "Remote Work", "Gym Membership", "Stock Options"],
  },
  {
    id: 2,
    name: "EcoLogistics",
    industry: "Supply Chain",
    location: "Seattle, WA",
    description: "Sustainable and eco-friendly logistics and supply chain management. We pride ourselves on reducing carbon footprints while maintaining high efficiency in global logistics operations. Our fleet is 100% electric and our warehouses use renewable energy.",
    logo: "https://ui-avatars.com/api/?name=Eco&background=22C55E&color=fff",
    openPositions: 2,
    website: "https://ecologistics.example.com",
    foundedYear: 2015,
    size: "201-500 Employees",
    benefits: ["Eco-friendly commuting allowance", "Health Insurance", "Flexible Hours"],
  },
  {
    id: 3,
    name: "HealthCore",
    industry: "Healthcare Tech",
    location: "Boston, MA",
    description: "Modernizing healthcare through advanced data analytics and patient platforms. Our mission is to improve patient outcomes by providing doctors and hospitals with real-time, AI-driven insights.",
    logo: "https://ui-avatars.com/api/?name=Health&background=EF4444&color=fff",
    openPositions: 8,
    website: "https://healthcore.example.com",
    foundedYear: 2018,
    size: "51-200 Employees",
    benefits: ["Comprehensive Medical", "Dental", "Vision", "401(k) Match"],
  },
  {
    id: 4,
    name: "FinFlow",
    industry: "Financial Services",
    location: "New York, NY",
    description: "Disrupting traditional banking with seamless digital finance solutions. FinFlow offers a suite of tools for personal finance management, peer-to-peer lending, and automated investing.",
    logo: "https://ui-avatars.com/api/?name=FinFlow&background=F59E0B&color=fff",
    openPositions: 3,
    website: "https://finflow.example.com",
    foundedYear: 2020,
    size: "11-50 Employees",
    benefits: ["Stock Options", "Flexible Hours", "Annual Retreat"],
  },
  {
    id: 5,
    name: "CreativePulse",
    industry: "Marketing & Design",
    location: "Austin, TX",
    description: "A full-service creative agency specializing in brand identity and digital marketing. We help brands tell their stories in visually compelling and emotionally resonant ways.",
    logo: "https://ui-avatars.com/api/?name=Creative&background=8B5CF6&color=fff",
    openPositions: 1,
    website: "https://creativepulse.example.com",
    foundedYear: 2010,
    size: "11-50 Employees",
    benefits: ["Unlimited PTO", "MacBook Pro", "Creative Workshops"],
  },
  {
    id: 6,
    name: "AeroDynamics",
    industry: "Aerospace",
    location: "Denver, CO",
    description: "Pioneering next-generation aerospace technologies and space exploration. AeroDynamics works with both public and private sectors to develop advanced propulsion systems and satellite tech.",
    logo: "https://ui-avatars.com/api/?name=Aero&background=3B82F6&color=fff",
    openPositions: 12,
    website: "https://aerodynamics.example.com",
    foundedYear: 2005,
    size: "501-1000 Employees",
    benefits: ["Health Insurance", "Relocation Package", "Continued Education Stipend"],
  }
];

export default function CompaniesDetails() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/companies/`);
        const companies = res.data.results || res.data;
        const foundCompany = companies.find(u => u.id === parseInt(id));
        
        if (foundCompany) {
          setCompany(foundCompany);
        } else {
          setError("Company not found.");
        }
      } catch (err) {
        console.error("Error fetching company:", err);
        setError("Failed to load company details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-24 px-4 max-w-4xl flex flex-col items-center text-center">
        <div className="h-16 w-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="text-xl font-bold text-gray-800 dark:text-gray-200 animate-pulse">{t("loadingCompanyDetails")}</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="container mx-auto py-24 px-4 max-w-4xl text-center">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h2 className="text-3xl font-bold mb-4 tracking-tight text-gray-900 dark:text-white">Not Found</h2>
        <p className="text-gray-500 mb-10 max-w-md mx-auto">{t("companyNotFound")}</p>
        <Button onClick={() => navigate('/companies', { state: location.state })} size="lg" className="rounded-2xl px-8 bg-gray-900 text-white hover:bg-gray-800">
          <ChevronLeft className="mr-2 h-4 w-4" /> {t("backToCompanies")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 pb-20">
      {/* Top Simple Nav */}
      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto max-w-6xl h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-slate-800/50">
          <button
            onClick={() => navigate('/companies', { state: location.state })}
            className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-indigo-600 transition-all group"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="group-hover:underline underline-offset-4">{t("backToCompanies")}</span>
          </button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`h-12 w-12 rounded-xl transition-all duration-300 hover:bg-transparent ${isFollowing ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
              onClick={() => setIsFollowing(!isFollowing)}
            >
              <Heart className={`h-6 w-6 ${isFollowing ? 'fill-pink-500 text-pink-500' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-transparent transition-all duration-300"
            >
              <Share2 className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto px-4 max-w-6xl pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (Content) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-800 shadow-sm">
              <div className="h-32 sm:h-48 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative"></div>
              
              <div className="p-6 sm:p-8 pt-0 relative">
                {/* Logo Overlapping Header */}
                <div className="flex justify-between items-end -mt-12 sm:-mt-16 mb-6 relative z-10">
                  <div className="h-24 w-24 sm:h-32 sm:w-32 bg-white dark:bg-slate-800 rounded-2xl p-2 border-4 border-white dark:border-slate-900 shadow-lg">
                    <img src={company.logo} alt={`${company.name} logo`} className="w-full h-full object-contain rounded-xl" />
                  </div>
                  <Button 
                    className={`rounded-xl px-6 font-bold shadow-sm ${isFollowing ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                    onClick={() => setIsFollowing(!isFollowing)}
                  >
                    {isFollowing ? t("following") : t("followCompany")}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                      {company.name}
                    </h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 font-medium mt-1">
                      {company.company_field || t("corporatePartner")}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-gray-600 dark:text-gray-400 font-semibold text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-slate-800 border flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-indigo-500" />
                      </div>
                      {company.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-slate-800 border flex items-center justify-center">
                        <Users className="h-4 w-4 text-indigo-500" />
                      </div>
                      {company.size}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-slate-800 border flex items-center justify-center">
                        <Globe className="h-4 w-4 text-indigo-500" />
                      </div>
                      <a href={company.website} target="_blank" rel="noreferrer" className="hover:text-indigo-600 hover:underline transition-all">
                        {t("website")}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* About Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm space-y-8">
              <section>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-500" />
                  {t("aboutUs")}
                </h2>
                <div className="text-gray-600 dark:text-gray-400 leading-relaxed text-base space-y-4">
                  {company.description.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </section>

              <section className="pt-8 border-t border-gray-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Award className="h-5 w-5 text-indigo-500" />
                  {t("benefitsPerks")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(company.benefits || ["Health Insurance", "Flexible Hours", "Professional Development"]).map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50">
                      <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-8">{t("companySnapshot")}</h3>
              <div className="space-y-6">
                <SidebarItem icon={Calendar} label={t("founded")} value={company.foundedYear?.toString() || t("notAvailable")} />
                <SidebarItem icon={Briefcase} label={t("field")} value={company.company_field || t("notAvailable")} />
                <SidebarItem icon={Users} label={t("companySize")} value={company.size || "10-50 Employees"} />
                <SidebarItem icon={Building2} label={t("headquarters")} value={company.location || t("notAvailable")} />
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800">
                <a href={company.website} target="_blank" rel="noreferrer" className="w-full">
                  <Button variant="outline" className="w-full h-12 rounded-xl text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all font-bold group">
                    {t("visitWebsite")}
                    <ExternalLink className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  </Button>
                </a>
                <Button className="w-full h-12 mt-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-bold group shadow-md shadow-gray-900/10">
                  <Mail className="mr-2 h-4 w-4" /> {t("contactUs")}
                </Button>
              </div>
            </div>

            {/* Open Positions Summary */}
            <div className="bg-indigo-600 dark:bg-indigo-900 rounded-3xl p-6 sm:p-8 shadow-lg text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Briefcase className="h-32 w-32" />
              </div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">{t("weAreHiring")}</h3>
                <p className="text-indigo-100 mb-6 text-sm">{t("joinOurTeam")}</p>
                <div className="flex items-center justify-between bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/20 mb-6">
                  <div>
                    <p className="text-3xl font-black">{company.open_positions_count || 0}</p>
                    <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">{t("openRoles")}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/internships')} 
                  className="w-full h-11 bg-white text-indigo-600 hover:bg-gray-50 rounded-xl font-bold shadow-sm"
                >
                  {t("viewOpportunities")}
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-500 shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{label}</p>
        <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
}
