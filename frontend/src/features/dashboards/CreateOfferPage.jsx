import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Briefcase,
  FileText,
  MapPin,
  Clock,
  GraduationCap,
  Users,
  Wand2,
  ImagePlus,
  X,
  Download,
  ArrowLeft
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import api from "@/api/api";
import { useToast } from "@/components/ui/custom-toast";

const SUGGESTED_SKILLS = [
  "React", "Node.js", "Python", "UI/UX Design", "Marketing",
  "Data Science", "Java", "C++", "SQL", "Graphic Design",
  "Project Management", "Social Media", "SEO", "Excel"
];

const ALGERIAN_WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
  "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers", "Djelfa", "Jijel", "Sétif", "Saïda",
  "Skikda", "Sidi Bel Abbès", "Annabba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla",
  "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
  "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar",
  "Ouled Djellal", "Béni Abbès", "In Salah", "In Guezzam", "Touggourt", "Djanet", "M'Ghair", "El Meniaa"
];

export default function CreateOfferPage() {
  const toast = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    offer_start_date: null,
    offer_end_date: null,
    internship_location: "ONSITE",
    internship_type: "FULL_TIME",
    internship_structure: "FOR_CREDIT",
    number_of_places: 1,
    wilaya: "Algiers",
    skills: [],
    image: null,
  });

  const [currentSkill, setCurrentSkill] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()],
      }));
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
    const fileInput = document.getElementById("image-upload");
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      if (formData.offer_start_date) {
        data.append("offer_start_date", format(formData.offer_start_date, "yyyy-MM-dd"));
      }
      if (formData.offer_end_date) {
        data.append("offer_end_date", format(formData.offer_end_date, "yyyy-MM-dd"));
      }
      data.append("internship_location", formData.internship_location);
      data.append("internship_type", formData.internship_type);
      data.append("internship_structure", formData.internship_structure);
      data.append("number_of_places", formData.number_of_places);
      data.append("wilaya", formData.wilaya);
      data.append("required_skills", JSON.stringify(formData.skills));

      if (formData.image) {
        data.append("banner_image", formData.image);
      }

      await api.post("/internships/create/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Internship offer created successfully!");
      navigate("/companydashboard/listings");
    } catch (err) {
      console.error("Error creating offer:", err);
      const errorMessage = err.response?.data 
        ? Object.entries(err.response.data).map(([key, value]) => `${key}: ${value}`).join("\n")
        : "Failed to create offer. Please check the fields and try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="p-4 md:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
    >
      
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate(-1)} 
          className="h-10 w-10 rounded-full shrink-0 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">Create Internship Offer</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium mt-1">
            Fill out the details below to post a new internship opportunity for students.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div>
              <div className="flex items-center text-[13px] text-blue-600 dark:text-blue-400 font-bold mb-5">
                <span className="pr-4">Basic Information</span>
                <div className="flex-1 border-t border-blue-100 dark:border-zinc-800"></div>
              </div>

              <div className="space-y-5">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 dark:text-zinc-300">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Frontend Developer Intern"
                    className="h-10 rounded-lg border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description" className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 dark:text-zinc-300">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Description
                  </Label>
                  <textarea
                    id="description"
                    rows={5}
                    value={formData.description}
                    onChange={handleChange}
                    className="flex w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-[13px] shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe the responsibilities, requirements, and what the intern will learn..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <div className="flex items-center text-[13px] text-blue-600 dark:text-blue-400 font-bold mb-5 mt-8">
                <span className="pr-4">Schedule</span>
                <div className="flex-1 border-t border-blue-100 dark:border-zinc-800"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="grid gap-2 flex flex-col">
                  <Label className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 dark:text-zinc-300">
                    <CalendarIcon className="h-4 w-4 text-blue-500" />
                    Start Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-10 justify-start text-left font-normal rounded-lg border-gray-200 dark:border-zinc-700",
                          !formData.offer_start_date && "text-gray-400"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.offer_start_date ? format(formData.offer_start_date, "PP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 pt-2 rounded-xl" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.offer_start_date}
                        onSelect={(date) => {
                          setFormData((prev) => ({
                            ...prev,
                            offer_start_date: date,
                            ...(prev.offer_end_date && prev.offer_end_date < date ? { offer_end_date: null } : {})
                          }));
                        }}
                        initialFocus
                        fixedWeeks
                        disabled={{ before: new Date() }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2 flex flex-col">
                  <Label className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 dark:text-zinc-300">
                    <CalendarIcon className="h-4 w-4 text-blue-500" />
                    End Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full h-10 justify-start text-left font-normal rounded-lg border-gray-200 dark:border-zinc-700",
                          !formData.offer_end_date && "text-gray-400"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.offer_end_date ? format(formData.offer_end_date, "PP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 pt-2" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.offer_end_date}
                        onSelect={(date) => setFormData((prev) => ({ ...prev, offer_end_date: date }))}
                        initialFocus
                        fixedWeeks
                        disabled={{ before: formData.offer_start_date || new Date() }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Details */}
            <div>
              <div className="flex items-center text-[13px] text-blue-600 dark:text-blue-400 font-bold mb-5 mt-8">
                <span className="pr-4">Details</span>
                <div className="flex-1 border-t border-blue-100 dark:border-zinc-800"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="internship_location" className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 dark:text-zinc-300">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    Location Type
                  </Label>
                  <select
                    id="internship_location"
                    value={formData.internship_location}
                    onChange={handleChange}
                    className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-lg border border-gray-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="ONSITE">Onsite</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="wilaya" className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 dark:text-zinc-300">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    Wilaya
                  </Label>
                  <select
                    id="wilaya"
                    value={formData.wilaya}
                    onChange={handleChange}
                    className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-lg border border-gray-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {ALGERIAN_WILAYAS.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div className="grid gap-2">
                  <Label htmlFor="internship_type" className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 dark:text-zinc-300">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Internship Type
                  </Label>
                  <select
                    id="internship_type"
                    value={formData.internship_type}
                    onChange={handleChange}
                    className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-lg border border-gray-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="internship_structure" className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 dark:text-zinc-300">
                    <GraduationCap className="h-4 w-4 text-blue-500" />
                    Structure
                  </Label>
                  <select
                    id="internship_structure"
                    value={formData.internship_structure}
                    onChange={handleChange}
                    className="flex h-10 w-full items-center justify-between whitespace-nowrap rounded-lg border border-gray-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="FOR_CREDIT">For Credit</option>
                    <option value="CO_OP">Co-op</option>
                    <option value="FELLOWSHIP">Fellowship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 mt-6">
                <div className="grid gap-2 max-w-sm">
                  <Label htmlFor="number_of_places" className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 dark:text-zinc-300">
                    <Users className="h-4 w-4 text-blue-500" />
                    No. of Positions
                  </Label>
                  <Input className="h-10 rounded-lg border-gray-200 dark:border-zinc-700 focus:ring-2 focus:ring-blue-500/20" type="number" id="number_of_places" value={formData.number_of_places} onChange={handleChange} placeholder="1" min="1" required />
                </div>
              </div>
            </div>

            {/* Requirements & Media */}
            <div>
              <div className="flex items-center text-[13px] text-blue-600 dark:text-blue-400 font-bold mb-5 mt-8">
                <span className="pr-4">Requirements & Media</span>
                <div className="flex-1 border-t border-blue-100 dark:border-zinc-800"></div>
              </div>

              <div className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="skills" className="flex items-center gap-2 text-[13px] font-semibold text-gray-700 dark:text-zinc-300">
                    <Wand2 className="h-4 w-4 text-blue-500" />
                    Required Skills
                  </Label>
                  <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-transparent shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="pl-2 pr-1 py-1.5 flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary border-none animate-in fade-in zoom-in duration-200">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="rounded-full hover:bg-primary/20 p-0.5"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </Badge>
                    ))}
                    <input
                      id="skills"
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill(e);
                        } else if (e.key === "Backspace" && !currentSkill && formData.skills.length > 0) {
                          removeSkill(formData.skills[formData.skills.length - 1]);
                        }
                      }}
                      placeholder={formData.skills.length === 0 ? "e.g. React, Python..." : ""}
                      className="flex-1 bg-transparent border-none outline-none text-sm min-w-[150px] h-9 px-1"
                    />
                  </div>

                  {/* Suggested Skills */}
                  <div className="mt-3">
                    <p className="text-[12px] font-semibold text-gray-500 dark:text-zinc-400 mb-2">Suggested Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_SKILLS.filter(s => !formData.skills.includes(s)).slice(0, 10).map((skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              skills: [...prev.skills, skill],
                            }));
                          }}
                          className="inline-flex items-center rounded-full border border-dashed border-primary/30 px-3 py-1 text-xs font-medium text-muted-foreground bg-primary/5 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200"
                        >
                          + {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="flex items-center gap-2">
                    <ImagePlus className="h-4 w-4 text-muted-foreground" />
                    Cover Image
                  </Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="image-upload"
                      className={cn(
                        "relative flex flex-col items-center justify-center w-full rounded-xl cursor-pointer transition-all duration-300 group overflow-hidden border-2 border-dashed",
                        imagePreview
                          ? "border-primary/40 bg-background"
                          : "border-muted-foreground/20 bg-muted/20 hover:bg-muted/40 hover:border-primary/30 h-64"
                      )}
                    >
                      {imagePreview ? (
                        <div className="relative w-full aspect-video group">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
                            <div className="flex items-center gap-2 text-white">
                              <Download className="h-5 w-5" />
                              <span className="text-sm font-medium">Click anywhere to change image</span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-4 right-4 h-10 w-10 rounded-full shadow-lg transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                          <div className="p-4 rounded-full bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                            <Download className="w-8 h-8" />
                          </div>
                          <p className="text-base font-semibold text-foreground mb-1">
                            Upload a image for this offer
                          </p>
                          <p className="text-sm text-muted-foreground max-w-[250px]">
                            Make your offer stand out with a high-quality cover photo
                          </p>
                          <p className="mt-6 text-[12px] font-semibold text-gray-500 dark:text-zinc-400">
                            PNG, JPG or JPEG
                          </p>
                        </div>
                      )}
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-8 pb-2">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="px-6 h-10 rounded-lg text-[13px] font-semibold text-gray-600">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="px-8 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold shadow-sm transition-colors">
                {isSubmitting ? "Creating..." : "Post Offer"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
