import React, { useState, useEffect } from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/api/api';
import { useLanguage } from '@/components/language-provider';

export default function Companies() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await api.get('/companies/');
        const data = response.data.results || response.data;
        setCompanies(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setError("Failed to load companies. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(company =>
    company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.company_field?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t("discoverCompanies")}</h1>
            <p className="text-gray-500 mt-1">{t("discoverCompaniesDesc")}</p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t("searchCompanies")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
            <p className="text-gray-500 font-medium">{t("loadingCompanies")}</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-red-100 shadow-sm">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium text-sm underline"
            >
              {t("tryAgain")}
            </button>
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm bg-gray-50 flex items-center justify-center border border-gray-100">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={`${company.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Briefcase className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{company.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1 gap-1">
                      <Briefcase className="w-4 h-4 shrink-0" />
                      <span className="truncate">{company.company_field || "N/A"}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1 gap-1">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="truncate">{company.location || "N/A"}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm flex-grow line-clamp-3 mb-6">
                  {company.description || t("noDescCompany")}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                    {company.open_positions_count} {company.open_positions_count === 1 ? t("openPosition") : t("openPositions")}
                  </span>

                  <Link
                    to={`/companies/${company.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all shadow-sm active:scale-95"
                  >
                    {t("viewDetails")}
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
            <h3 className="text-lg font-medium text-gray-900">{t("noCompaniesFound")}</h3>
            <p className="text-gray-500 mt-1">{t("noCompaniesMatch")}</p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
            >
              {t("clearSearch")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}