/* eslint-disable @typescript-eslint/no-explicit-any */
/*eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
 
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Search } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  industry?: string;
  isVerified: boolean;
}

interface FilterOptions {
  companies: string[];
  industries: string[];
  statuses: string[];
}

interface CompanyFilterProps {
  companies: Company[];
  onFilterChange: (filters: FilterOptions) => void;
  activeFilters: FilterOptions;
}

const CompanyFilter: React.FC<CompanyFilterProps> = ({
  companies,
  onFilterChange,
  activeFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerms, setSearchTerms] = useState({
    company: '',
    industry: '',
  });

  // Extract unique values from companies
  const filterData = useMemo(() => {
    const uniqueCompanies = Array.from(
      new Set(companies.map((c) => c.name))
    ).sort();
    
    const uniqueIndustries = Array.from(
      new Set(
        companies
          .map((c) => c.industry)
          .filter((industry): industry is string => !!industry)
      )
    ).sort();

    const statuses = ['Verified', 'Pending'];

    return {
      companies: uniqueCompanies,
      industries: uniqueIndustries,
      statuses,
    };
  }, [companies]);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    return {
      companies: filterData.companies.filter((name) =>
        name.toLowerCase().includes(searchTerms.company.toLowerCase())
      ),
      industries: filterData.industries.filter((industry) =>
        industry.toLowerCase().includes(searchTerms.industry.toLowerCase())
      ),
    };
  }, [filterData, searchTerms]);

  const handleToggleFilter = (
    type: 'companies' | 'industries' | 'statuses',
    value: string
  ) => {
    if (type === 'statuses') {
      // Radio button behavior for status - only one can be selected
      const newStatuses = activeFilters.statuses.includes(value) ? [] : [value];
      onFilterChange({
        ...activeFilters,
        statuses: newStatuses,
      });
    } else {
      // Checkbox behavior for companies and industries
      const currentFilters = [...activeFilters[type]];
      const index = currentFilters.indexOf(value);

      if (index > -1) {
        currentFilters.splice(index, 1);
      } else {
        currentFilters.push(value);
      }

      onFilterChange({
        ...activeFilters,
        [type]: currentFilters,
      });
    }
  };

  const handleClearAll = () => {
    onFilterChange({
      companies: [],
      industries: [],
      statuses: [],
    });
    setSearchTerms({
      company: '',
      industry: '',
    });
  };

  const handleClearSection = (type: 'companies' | 'industries' | 'statuses') => {
    onFilterChange({
      ...activeFilters,
      [type]: [],
    });
  };

  const totalActiveFilters =
    activeFilters.companies.length +
    activeFilters.industries.length +
    activeFilters.statuses.length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
         
          {totalActiveFilters > 0 && (
            <Badge
              variant="default"
              className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
            >
              {totalActiveFilters}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filter</SheetTitle>
          
        </SheetHeader>

        <div className="py-4 space-y-6">
          {/* Active Filters Summary */}
          {totalActiveFilters > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Active Filters</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="h-8 text-xs"
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.companies.map((company) => (
                  <Badge
                    key={company}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleToggleFilter('companies', company)}
                  >
                    {company}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
                {activeFilters.industries.map((industry) => (
                  <Badge
                    key={industry}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleToggleFilter('industries', industry)}
                  >
                    {industry}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
                {activeFilters.statuses.map((status) => (
                  <Badge
                    key={status}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleToggleFilter('statuses', status)}
                  >
                    {status}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
            {/* Company Filter */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="company-search" className="font-semibold">
                  Company
                </Label>
                {activeFilters.companies.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleClearSection('companies')}
                    className="h-6 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company-search"
                  placeholder="Type to search companies..."
                  value={searchTerms.company}
                  onChange={(e) =>
                    setSearchTerms((prev) => ({
                      ...prev,
                      company: e.target.value,
                    }))
                  }
                  className="pl-8"
                />
              </div>
              {searchTerms.company && (
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                  {filteredOptions.companies.length > 0 ? (
                    filteredOptions.companies.map((company) => (
                      <div
                        key={company}
                        className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                        onClick={() => handleToggleFilter('companies', company)}
                      >
                        <input
                          type="checkbox"
                          checked={activeFilters.companies.includes(company)}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label className="text-sm flex-1 cursor-pointer">
                          {company}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No companies found
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Industry Filter */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="industry-search" className="font-semibold">
                  Industry
                </Label>
                {activeFilters.industries.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleClearSection('industries')}
                    className="h-6 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="industry-search"
                  placeholder="Type to search industries..."
                  value={searchTerms.industry}
                  onChange={(e) =>
                    setSearchTerms((prev) => ({
                      ...prev,
                      industry: e.target.value,
                    }))
                  }
                  className="pl-8"
                />
              </div>
              {searchTerms.industry && (
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                  {filteredOptions.industries.length > 0 ? (
                    filteredOptions.industries.map((industry) => (
                      <div
                        key={industry}
                        className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                        onClick={() => handleToggleFilter('industries', industry)}
                      >
                        <input
                          type="checkbox"
                          checked={activeFilters.industries.includes(industry)}
                          onChange={() => {}}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <label className="text-sm flex-1 cursor-pointer">
                          {industry}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No industries found
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="font-semibold">
                  Status
                </Label>
                {activeFilters.statuses.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleClearSection('statuses')}
                    className="h-6 text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="space-y-2 border rounded-md p-3">
                {filterData.statuses.map((status) => (
                  <div
                    key={status}
                    className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                    onClick={() => handleToggleFilter('statuses', status)}
                  >
                    <input
                      type="radio"
                      checked={activeFilters.statuses.includes(status)}
                      onChange={() => {}}
                      className="h-4 w-4"
                      name="status-filter"
                    />
                    <label className="text-sm flex-1 cursor-pointer">
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="border-t pt-4">
        <Button
  onClick={() => setIsOpen(false)}
  className="
    w-full 
    bg-blue-600 
    text-white 
    font-semibold 
    py-2 
    rounded-xl 
    shadow-md 
    hover:bg-blue-700 
    hover:shadow-lg 
    transition 
    duration-300 
    ease-in-out 
    border-none
  "
>
  Apply Filters
</Button>

        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CompanyFilter;