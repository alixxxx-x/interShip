import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  X, 
  Download, 
  Wand2,
  UserRound,
  UsersRound,
  UserRoundPen,
  Briefcase,
  School,  
  MailCheck,
  PhoneCall,
  House,
  GraduationCap,
} from "lucide-react";
import api from "@/api/api";

const SUGGESTED_SKILLS = [
  "React", "Node.js", "Python", "UI/UX Design", "Marketing",
  "Data Science", "Java", "C++", "SQL", "Graphic Design",
  "Project Management", "Social Media", "SEO", "Excel"
];

const SUGGESTED_LANGUAGES = [
  "English", "Arabic", "French", "Spanish", "German", "Portuguese", "Italian"
];

export default function CreateCvModal({ 
    open, 
    onOpenChange, 
    triggerButton, 
    onCvCreated 
}) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    image: null,
    phone_number: "",
    email: "",
    address: "",
    education: "",
    skills: [],
    profile_summary: "",
    any_experience: "",
    languages: [],
    pdfFile: null,
  });
  const [currentSkill, setCurrentSkill] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [pdfName, setPdfName] = useState(null);
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

  const removeLanguage = (languageToRemove) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== languageToRemove),
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

  const handlePdfChange = (e) => {

    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, pdfFile: file }));
    setPdfName(file.name);

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map((itm) => itm.str);
          fullText += strings.join(" ") + "\n";
        }

        const text = fullText;
        const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        const phoneMatch = text.match(/(\+?\d[\d\s().-]{6,}\d)/);
        const nameMatch = text.match(/\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/);
        const foundSkills = SUGGESTED_SKILLS.filter((s) => new RegExp("\\b" + s.replace('.', '\\.') + "\\b", "i").test(text));
        const LANGS = SUGGESTED_LANGUAGES.filter(l => new RegExp("\\b" + l + "\\b", "i").test(text));
        const foundLangs = LANGS.filter((l) => new RegExp("\\b" + l + "\\b", "i").test(text));

        setFormData((prev) => ({
          ...prev,
          email: prev.email || (emailMatch ? emailMatch[0] : prev.email),
          phone_number: prev.phone_number || (phoneMatch ? phoneMatch[0].trim() : prev.phone_number),
          first_name: prev.first_name || (nameMatch ? nameMatch[0].split(' ')[0] : prev.first_name),
          last_name: prev.last_name || (nameMatch ? nameMatch[0].split(' ').slice(1).join(' ') : prev.last_name),
          skills: Array.from(new Set([...(prev.skills || []), ...foundSkills])),
          languages: Array.from(new Set([...(prev.languages || []), ...foundLangs])),
        }));
      } catch (err) {
        console.error("PDF parsing failed", err);
      }
    })();
  };

  const handleRemovePdf = (e) => {
    e?.preventDefault();
    setFormData((prev) => ({ ...prev, pdfFile: null }));
    setPdfName(null);
    const input = document.getElementById("pdf-upload");
    if (input) input.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        if (k === "skills" || k === "languages") data.append(k, JSON.stringify(v));
        else if (k === "image" || k === "pdfFile") data.append(k, v);
        else data.append(k, v);
      });

      const res = await api.post("/cv/create/", data);
      if (onCvCreated) onCvCreated(res.data);
      if (onOpenChange) onOpenChange(false);
    } catch (err) {
      console.error("Error creating CV", err);
      alert("Failed to submit CV. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogContent = (
    <DialogContent className="overflow-y-auto max-h-[90vh] sm:max-w-[700px]">
      <DialogHeader>
        <DialogTitle>Create CV</DialogTitle>
        <DialogDescription>
          Enter your details or upload a PDF to prefill fields.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit}>

        <div className="flex items-center text-xs uppercase text-muted-foreground font-semibold mt-2 mb-1">
          <div className="flex-1 border-t"></div>
          <span className="px-3">Personal Information</span>
          <div className="flex-1 border-t"></div>
        </div>

        <div className="grid grid-cols-2 gap-5 py-2">
          <div className="grid gap-2">
            <Label htmlFor="first_name" className="flex items-center gap-2">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              First name
            </Label>
            <Input 
              id="first_name" 
              value={formData.first_name} 
              onChange={handleChange} 
              placeholder="Enter your first name" 
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="last_name" className="flex items-center gap-2">
              <UsersRound className="h-4 w-4 text-muted-foreground" />
              Last name
            </Label>
            <Input 
              id="last_name" 
              value={formData.last_name} 
              onChange={handleChange} 
              placeholder="Enter your last name"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="profile_summary" className="flex items-center gap-2">
            <UserRoundPen className="h-4 w-4 text-muted-foreground" />
            Profile summary
          </Label>
          <textarea
           id="profile_summary" 
           value={formData.profile_summary} 
           onChange={handleChange} 
           className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
           placeholder="A brief summary about you, your background, and what you're looking for (optional)"
           required
          />
        </div>

        <div className="flex items-center text-xs uppercase text-muted-foreground font-semibold mt-2 mb-1">
          <div className="flex-1 border-t"></div>
          <span className="px-3">contact information</span>
          <div className="flex-1 border-t"></div>
        </div>

        <div className="grid gap-2 py-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <MailCheck className="h-4 w-4 text-muted-foreground" />
            Email
          </Label>
          <Input 
            id="email" 
            value={formData.email} 
            onChange={handleChange} 
            placeholder="example@gmail.com"
            type="email"
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            required
          />
        </div>

        <div className="grid gap-2 py-2">
          <Label htmlFor="phone_number" className="flex items-center gap-2">
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
            Phone Number
          </Label>
          <Input 
            id="phone_number" 
            value={formData.phone_number} 
            onChange={handleChange} 
            placeholder="0555555555"
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            required
          />
        </div>
        
        <div className="grid gap-2 py-2">
          <Label htmlFor="address" className="flex items-center gap-2">
            <House className="h-4 w-4 text-muted-foreground" />
            Address
          </Label>
          <Input 
            id="address" 
            value={formData.address} 
            onChange={handleChange} 
            placeholder="N° 123, Street Name, City, Country"
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            required
          />
        </div>

        <div className="flex items-center text-xs uppercase text-muted-foreground font-semibold mt-2 mb-1">
          <div className="flex-1 border-t"></div>
          <span className="px-3">professional information</span>
          <div className="flex-1 border-t"></div>
        </div>

        <div className="grid gap-2 py-2">
          <Label htmlFor="education" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            Education
          </Label>
          <textarea
            id="education" 
            value={formData.education} 
            onChange={handleChange} 
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            placeholder="e.g. Bachelor's in Computer Science from XYZ University"
            required
          />
        </div>

        <div className="grid gap-2 py-2">
          <Label htmlFor="any_experience" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            Experience
          </Label>
          <textarea
           id="any_experience" 
           value={formData.any_experience} 
           onChange={handleChange} 
           className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"  rows={3}
           placeholder="e.g. Software Engineer at ABC Corp (2020-2023): Developed web applications using React and Node.js."
           required
          />
        </div>
  
        <div className="grid gap-4 py-2">
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
        </div>


        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="skills" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-muted-foreground" />
              Required Languages
            </Label>
            <div className="flex flex-wrap items-center gap-2 p-2 rounded-md border border-input bg-transparent shadow-sm focus-within:ring-1 focus-within:ring-ring transition-all">
              {formData.languages.map((language) => (
                <Badge key={language} variant="secondary" className="pl-2 pr-1 py-1 flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary border-none animate-in fade-in zoom-in duration-200">
                  {language}
                  <button
                    type="button"
                    onClick={() => removeLanguage(language)}
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
                placeholder={formData.skills.length === 0 ? "e.g. English, French..." : ""}
                className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px] h-7"
              />
            </div>

            {/* Suggested Languages */}
            <div className="mt-2">
              <p className="text-[10px] font-medium text-muted-foreground uppercase mb-2 tracking-wider">Suggested Languages</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_LANGUAGES.filter(l => !formData.languages.includes(l)).slice(0, 10).map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        languages: [...prev.languages, language],
                      }));
                    }}
                    className="inline-flex items-center rounded-full border border-dashed border-primary/30 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground bg-primary/5 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all duration-200"
                  >
                    + {language}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

                <div className="flex items-center text-xs uppercase text-muted-foreground font-semibold mt-2 mb-1">
          <div className="flex-1 border-t"></div>
          <span className="px-3">OR</span>
          <div className="flex-1 border-t"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 items-start">
        {/* 
          <div>
            <Label htmlFor="image-upload">Profile Image</Label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-2">
                <ImagePlus />
                <span className="text-sm">Upload</span>
                <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="preview" className="w-20 h-20 object-cover rounded" />
                  <button type="button" onClick={handleRemoveImage} className="absolute top-0 right-0 p-1 bg-white rounded-full">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        */}
          <div className="grid gap-2">
            <Label htmlFor="pdf-upload">Upload your CV</Label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-2">
                <Download />
                <span className="text-sm">PDF</span>
                <input id="pdf-upload" type="file" accept="application/pdf" onChange={handlePdfChange} className="hidden" />
              </label>
              {pdfName && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">{pdfName}</span>
                  <button type="button" onClick={handleRemovePdf} className="p-1 bg-white rounded">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Create CV"}</Button>
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
        {triggerButton || <Button><Plus className="mr-2 h-4 w-4" />Create CV</Button>}
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
