import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filters, ApplicationStatus } from "@/types";
import { useState } from "react";

interface MergedSidebarProps {
  filters: Filters;
  statusOptions: ApplicationStatus[];
  locationOptions: string[];
  employmentTypeOptions: { value: string; label: string }[];
  loading: boolean;
  updateSearchFilter: (value: string) => void;
  updateStatusFilter: (statusId: string) => void;
  updateLocationFilter: (location: string) => void;
  updateEmploymentTypeFilter: (type: string) => void;
  updateDateFilter: (field: "dateFrom" | "dateTo", date: Date | null) => void;
  onFilterChange: (name: string, value: string) => void;
  onResetFilters: () => void;
}

const FilterContent = ({
  filters,
  statusOptions = [],
  locationOptions = [],
  employmentTypeOptions = [],
  loading,
  updateSearchFilter,
  updateStatusFilter,
  updateLocationFilter,
  updateEmploymentTypeFilter,
  updateDateFilter,
  onFilterChange,
  onResetFilters,
}: MergedSidebarProps) => {
  const [showAllLocations, setShowAllLocations] = useState(false);
  
  return (
    <div className="space-y-6 p-1">
      <div>
        <h2 className="text-lg font-semibold mb-4">Filter Applications</h2>

        {/* Search Input - Hidden on mobile as it's in the header */}
        <div className="hidden lg:block mb-4">
          <Input
            type="text"
            placeholder="Search applications..."
            value={filters.search}
            onChange={(e) => updateSearchFilter(e.target.value)}
          />
        </div>

        {/* Status Filter - Most relevant for applications */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Status</h3>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          ) : statusOptions && statusOptions.length > 0 ? (
            statusOptions.map((status) => (
              <div key={status.id} className="flex items-center space-x-3 mb-3">
                <Checkbox
                  id={`status-${status.id}`}
                  checked={filters.status.includes(status.id)}
                  onCheckedChange={() => updateStatusFilter(status.id)}
                />
                <Label
                  htmlFor={`status-${status.id}`}
                  className="flex items-center text-sm cursor-pointer flex-1"
                >
                  <div
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: status.color || "#888888" }}
                  />
                  {status.name}
                </Label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No statuses available
            </p>
          )}
        </div>

        <Separator className="my-6" />

        {/* Location Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Location</h3>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          ) : locationOptions && locationOptions.length > 0 ? (
            <>
              <div className="max-h-48 overflow-y-auto">
                {locationOptions
                  .slice(0, showAllLocations ? locationOptions.length : 5)
                  .map((location) => (
                    <div
                      key={location}
                      className="flex items-center space-x-3 mb-3"
                    >
                      <Checkbox
                        id={`location-${location}`}
                        checked={filters.location.includes(location)}
                        onCheckedChange={() => updateLocationFilter(location)}
                      />
                      <Label 
                        htmlFor={`location-${location}`}
                        className="text-sm cursor-pointer flex-1 truncate"
                        title={location}
                      >
                        {location}
                      </Label>
                    </div>
                  ))}
              </div>
              {locationOptions.length > 5 && (
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm mt-2"
                  onClick={() => setShowAllLocations(!showAllLocations)}
                >
                  {showAllLocations ? "Show Less" : `Show More (${locationOptions.length - 5})`}
                </Button>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No locations available
            </p>
          )}
        </div>

        {/* Employment Type Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Job Type</h3>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          ) : employmentTypeOptions && employmentTypeOptions.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {employmentTypeOptions.map((type) => (
                <div
                  key={type.value}
                  className="flex items-center space-x-3"
                >
                  <Checkbox
                    id={`type-${type.value}`}
                    checked={filters.employmentType.includes(type.value)}
                    onCheckedChange={() => updateEmploymentTypeFilter(type.value)}
                  />
                  <Label 
                    htmlFor={`type-${type.value}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No job types available
            </p>
          )}
        </div>

        <Separator className="my-6" />

        {/* Date Filters */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Applied Date Range</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="date-from" className="text-xs text-muted-foreground mb-2 block">
                From
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal text-sm h-9"
                    id="date-from"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom
                      ? format(filters.dateFrom, "MMM dd, yyyy")
                      : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom || undefined}
                    onSelect={(date) =>
                      updateDateFilter("dateFrom", date || null)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="date-to" className="text-xs text-muted-foreground mb-2 block">
                To
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal text-sm h-9"
                    id="date-to"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo
                      ? format(filters.dateTo, "MMM dd, yyyy")
                      : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo || undefined}
                    onSelect={(date) =>
                      updateDateFilter("dateTo", date || null)
                    }
                    initialFocus
                    disabled={(date) => 
                      filters.dateFrom ? date < filters.dateFrom : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Salary Range Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Salary Range</h3>
          <Select
            value={filters.salaryRange || "0"}
            onValueChange={(value) => onFilterChange("salaryRange", value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select salary range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any Salary</SelectItem>
              <SelectItem value="0-50000">$0 - $50,000</SelectItem>
              <SelectItem value="50000-75000">$50,000 - $75,000</SelectItem>
              <SelectItem value="75000-100000">$75,000 - $100,000</SelectItem>
              <SelectItem value="100000-150000">$100,000 - $150,000</SelectItem>
              <SelectItem value="150000-200000">$150,000 - $200,000</SelectItem>
              <SelectItem value="200000+">$200,000+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className="my-6" />

        {/* Reset Filters Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={onResetFilters}
        >
          Reset All Filters
        </Button>
      </div>
    </div>
  );
};

export const MergedSidebar = (props: MergedSidebarProps) => {
  return (
    // Desktop Sidebar - hidden on mobile and tablet
    <div className="w-64 border-r bg-background hidden lg:block p-2">
      <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <FilterContent {...props} />
      </div>
    </div>
  );
};