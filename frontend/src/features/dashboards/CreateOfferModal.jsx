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
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


export default function CreateOfferModal({ 
  open, 
  onOpenChange, 
  triggerButton, 
  onOfferCreated 
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    offer_start_date: null,
    offer_end_date: null,
    internship_location: "ONSITE",
    internship_type: "FULL_TIME",
    internship_structure: "FOR_CREDIT",
    number_of_places: 1,
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting Offer:", formData);
  
    setFormData({
      title: "",
      description: "",
      offer_start_date: null,
      offer_end_date: null,
      internship_location: "ONSITE",
      internship_type: "FULL_TIME",
      internship_structure: "FOR_CREDIT",
      number_of_places: 1,
    });
    
    if (onOfferCreated) onOfferCreated();
    if (onOpenChange) onOpenChange(false);
  };

  const DialogBody = () => (
    <DialogContent className="overflow-y-auto max-h-[90vh] sm:max-w-[700px]">
      <DialogHeader>
        <DialogTitle>Create Internship Offer</DialogTitle>
        <DialogDescription>
          Fill out the details below to post a new internship opportunity.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Frontend Developer Intern"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              placeholder="Describe the responsibilities and requirements..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2 flex flex-col">
              <Label>Start Date</Label>
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
                <PopoverContent className="w-auto p-0 z-50 pt-2" align="start" side="bottom" avoidCollisions={false}>
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
              <Label>End Date</Label>
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
                <PopoverContent className="w-auto p-0 z-50 pt-2" align="start" side="bottom" avoidCollisions={false}>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="internship_location">Location Type</Label>
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
              <Label htmlFor="internship_type">Internship Type</Label>
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
              <Label htmlFor="internship_structure">Structure</Label>
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
              <Label htmlFor="number_of_places">No. of Positions</Label>
              <Input type="number" id="number_of_places" value={formData.number_of_places} onChange={handleChange} placeholder="1" min="1" required />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Create Offer</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );

  
  if (open !== undefined && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogBody />
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
      <DialogBody />
    </Dialog>
  );
}