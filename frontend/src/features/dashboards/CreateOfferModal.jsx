import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Plus,
  Briefcase,
  FileText,
  MapPin,
  Clock,
  GraduationCap,
  Users,
  Wand2,
  ImagePlus,
  X,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import api from "@/api/api";

const SUGGESTED_SKILLS = [
  "React", "Node.js", "Python", "UI/UX Design", "Marketing",
  "Data Science", "Java", "C++", "SQL", "Graphic Design",
  "Project Management", "Social Media", "SEO", "Excel"
];

export default function CreateOfferModal({
  open,
  onOpenChange,
  triggerButton,
  onOfferCreated,
  initialData = null // Added for edit mode
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    offer_start_date: initialData?.offer_start_date || null,
    offer_end_date: initialData?.offer_end_date || null,
    internship_location: initialData?.internship_location || "ONSITE",
    internship_type: initialData?.internship_type || "FULL_TIME",
    internship_structure: initialData?.internship_structure || "FOR_CREDIT",
    number_of_places: initialData?.number_of_places || 1,
    skills: initialData?.tech || initialData?.required_skills || [],
    image: null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        offer_start_date: initialData.offer_start_date || null,
        offer_end_date: initialData.offer_end_date || null,
        internship_location: initialData.internship_location || "ONSITE",
        internship_type: initialData.internship_type || "FULL_TIME",
        internship_structure: initialData.internship_structure || "FOR_CREDIT",
        number_of_places: initialData.number_of_places || 1,
        skills: initialData.tech || initialData.required_skills || [],
        image: null,
      });
      if (initialData.internship_image) {
        setImagePreview(initialData.internship_image);
      }
    }
  }, [initialData, open]);

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
    // Reset file input value so same file can be re-selected
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
      data.append("offer_start_date", format(formData.offer_start_date, "yyyy-MM-dd"));
      data.append("offer_end_date", format(formData.offer_end_date, "yyyy-MM-dd"));
      data.append("internship_location", formData.internship_location);
      data.append("internship_type", formData.internship_type);
      data.append("internship_structure", formData.internship_structure);
      data.append("number_of_places", formData.number_of_places);
      // Send skills as JSON string
      data.append("required_skills", JSON.stringify(formData.skills));

      if (formData.image) {
        data.append("banner_image", formData.image);
      }

      if (initialData) {
        await api.patch(`/internships/${initialData.id}/update/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/internships/create/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (onOfferCreated) onOfferCreated();
      if (onOpenChange) onOpenChange(false);
      
      if (!initialData) {
        setFormData({
          title: "",
          description: "",
          offer_start_date: null,
          offer_end_date: null,
          internship_location: "ONSITE",
          internship_type: "FULL_TIME",
          internship_structure: "FOR_CREDIT",
          number_of_places: 1,
          skills: [],
          image: null,
        });
        setImagePreview(null);
      }
    } catch (err) {
      console.error("Error creating offer:", err);
      alert("Failed to create offer. Please check the fields and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogContent = (
    <DialogContent className="overflow-y-auto max-h-[90vh] sm:max-w-[700px]">
      <DialogHeader>
        <DialogTitle>{initialData ? "Edit Internship Offer" : "Create Internship Offer"}</DialogTitle>
        <DialogDescription>
          {initialData 
            ? "Update the details of your internship opportunity." 
            : "Fill out the details below to post a new internship opportunity."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-5 py-2">
          <div className="flex items-center text-xs uppercase text-muted-foreground font-semibold mt-2 mb-1">
            <div className="flex-1 border-t"></div>
            <span className="px-3">Basic Information</span>
            <div className="flex-1 border-t"></div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Frontend Developer Intern"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Description
            </Label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              placeholder="Describe the responsibilities, requirements, and what the intern will learn..."
              required
            />
          </div>

          <div className="flex items-center text-xs uppercase text-muted-foreground font-semibold mt-4 mb-1">
            <div className="flex-1 border-t"></div>
            <span className="px-3">Schedule</span>
            <div className="flex-1 border-t"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2 flex flex-col">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                Start Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.offer_start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.offer_start_date ? format(formData.offer_start_date, "PP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50 pt-2" align="start">
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
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                End Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.offer_end_date && "text-muted-foreground"
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

          <div className="flex items-center text-xs uppercase text-muted-foreground font-semibold mt-4 mb-1">
            <div className="flex-1 border-t"></div>
            <span className="px-3">Details</span>
            <div className="flex-1 border-t"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="internship_location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Location Type
              </Label>
              <select
                id="internship_location"
                value={formData.internship_location}
                onChange={handleChange}
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="ONSITE">Onsite</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="internship_type" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Internship Type
              </Label>
              <select
                id="internship_type"
                value={formData.internship_type}
                onChange={handleChange}
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="internship_structure" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                Structure
              </Label>
              <select
                id="internship_structure"
                value={formData.internship_structure}
                onChange={handleChange}
                className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="FOR_CREDIT">For Credit</option>
                <option value="CO_OP">Co-op</option>
                <option value="FELLOWSHIP">Fellowship</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="number_of_places" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                No. of Positions
              </Label>
              <Input type="number" id="number_of_places" value={formData.number_of_places} onChange={handleChange} placeholder="1" min="1" required />
            </div>
          </div>

          <div className="flex items-center text-xs uppercase text-muted-foreground font-semibold mt-4 mb-1">
            <div className="flex-1 border-t"></div>
            <span className="px-3">Requirements & Media</span>
            <div className="flex-1 border-t"></div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="skills" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-muted-foreground" />
                Required Skills
              </Label>
              <div className="flex flex-wrap items-center gap-2 p-2 rounded-md border border-input bg-transparent shadow-sm focus-within:ring-1 focus-within:ring-ring transition-all">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary border-none animate-in fade-in zoom-in duration-200">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="rounded-full hover:bg-primary/20 p-0.5"
                    >
                      <X className="h-3 w-3" />
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
                      // Remove last skill on backspace if input is empty
                      removeSkill(formData.skills[formData.skills.length - 1]);
                    }
                  }}
                  placeholder={formData.skills.length === 0 ? "e.g. React, Python..." : ""}
                  className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px] h-7"
                />
              </div>

              {/* Suggested Skills */}
              <div className="mt-2">
                <p className="text-[10px] font-medium text-muted-foreground uppercase mb-2 tracking-wider">Suggested Skills</p>
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
                      className="inline-flex items-center rounded-full border border-dashed border-primary/30 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground bg-primary/5 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200"
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
                      : "border-muted-foreground/20 bg-muted/20 hover:bg-muted/40 hover:border-primary/30 h-52"
                  )}
                >
                  {imagePreview ? (
                    <div className="relative w-full aspect-video group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
                        <div className="flex items-center gap-2 text-white">
                          <Download className="h-4 w-4" />
                          <span className="text-xs font-medium">Click anywhere to change image</span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-3 right-3 h-8 w-8 rounded-full shadow-lg transform translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                      <div className="p-3 rounded-full bg-primary/10 text-primary mb-3 group-hover:scale-110 transition-transform duration-300">
                        <Download className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-semibold text-foreground mb-1">
                        Upload a image for this offer
                      </p>
                      <p className="text-xs text-muted-foreground max-w-[200px]">
                        Make your offer stand out with a high-quality cover photo
                      </p>
                      <p className="mt-4 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
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
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting 
              ? (initialData ? "Saving..." : "Creating...") 
              : (initialData ? "Save Changes" : "Create Offer")}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );


  if (open !== undefined && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Quick Add
          </Button>
        )}
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}