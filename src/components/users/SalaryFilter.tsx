import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface SalaryFilterProps {
  onSalaryRangeChange: (minSalary: string, maxSalary: string) => void;
  onReset: () => void;
}

interface SalaryRange {
  amount: string;
  frequency: string;
}

const SalaryFilter: React.FC<SalaryFilterProps> = ({ 
  onSalaryRangeChange, 
  onReset 
}) => {
  const [includeNotDisclosed, setIncludeNotDisclosed] = useState(true);
  const [minSalary, setMinSalary] = useState<SalaryRange>({ amount: "", frequency: "monthly" });
  const [maxSalary, setMaxSalary] = useState<SalaryRange>({ amount: "", frequency: "monthly" });
  
  // Use ref to track previous values and prevent unnecessary updates
  const prevValuesRef = useRef({ min: "", max: "" });

  // Convert salary to a comparable format (monthly basis for comparison)
  const convertToMonthly = useCallback((amount: string, frequency: string): number => {
    if (!amount) return 0;
    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return 0;
    
    switch (frequency) {
      case "yearly":
        return (numericAmount * 100000) / 12; // LPA to monthly
      case "quarterly":
        return numericAmount / 3;
      case "monthly":
      default:
        return numericAmount;
    }
  }, []);

  // Format salary for display/comparison
  const formatSalary = useCallback((amount: string, frequency: string): string => {
    if (!amount) return "";
    
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) return "";
    
    if (frequency === "yearly") {
      return `${numericAmount}LPA`;
    } else {
      const formattedAmount = Math.floor(numericAmount).toLocaleString('en-IN');
      const frequencyMap = {
        monthly: "month",
        quarterly: "quarter"
      };
      return `Rs. ${formattedAmount}/${frequencyMap[frequency as keyof typeof frequencyMap]}`;
    }
  }, []);

  // Update parent component when salary range changes - with debouncing
  useEffect(() => {
    const minFormatted = formatSalary(minSalary.amount, minSalary.frequency);
    const maxFormatted = formatSalary(maxSalary.amount, maxSalary.frequency);
    
    // Only call parent callback if values actually changed
    if (prevValuesRef.current.min !== minFormatted || prevValuesRef.current.max !== maxFormatted) {
      prevValuesRef.current = { min: minFormatted, max: maxFormatted };
      
      const timeoutId = setTimeout(() => {
        onSalaryRangeChange(minFormatted, maxFormatted);
      }, 300); // 300ms debounce
      
      return () => clearTimeout(timeoutId);
    }
  }, [minSalary, maxSalary, formatSalary, onSalaryRangeChange]);

  const handleAmountChange = useCallback((
    value: string, 
    frequency: string,
    type: 'min' | 'max'
  ) => {
    let formattedValue = "";
    
    if (frequency === "yearly") {
      // Allow numbers and decimal point for LPA format
      formattedValue = value.replace(/[^\d.]/g, "");
      // Ensure only one decimal point
      const parts = formattedValue.split(".");
      formattedValue = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : formattedValue;
    } else {
      // Only allow numbers for monthly/quarterly
      formattedValue = value.replace(/\D/g, "");
    }

    if (type === 'min') {
      setMinSalary(prev => ({ ...prev, amount: formattedValue }));
    } else {
      setMaxSalary(prev => ({ ...prev, amount: formattedValue }));
    }
  }, []);

  const handleFrequencyChange = useCallback((frequency: string, type: 'min' | 'max') => {
    if (type === 'min') {
      setMinSalary(prev => ({ ...prev, frequency, amount: "" }));
    } else {
      setMaxSalary(prev => ({ ...prev, frequency, amount: "" }));
    }
  }, []);

  const handleReset = useCallback(() => {
    setIncludeNotDisclosed(true);
    setMinSalary({ amount: "", frequency: "monthly" });
    setMaxSalary({ amount: "", frequency: "monthly" });
    prevValuesRef.current = { min: "", max: "" };
    onReset();
  }, [onReset]);

  const isValidRange = useCallback(() => {
    if (!minSalary.amount || !maxSalary.amount) return true;
    
    const minMonthly = convertToMonthly(minSalary.amount, minSalary.frequency);
    const maxMonthly = convertToMonthly(maxSalary.amount, maxSalary.frequency);
    
    return minMonthly <= maxMonthly;
  }, [minSalary, maxSalary, convertToMonthly]);

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-3">Salary Range</h3>
      
      <div className="space-y-4">
        {/* Include Not Disclosed Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label className="text-sm font-normal">Include &quot;Not disclosed &quot;</Label>
            <p className="text-xs text-muted-foreground">
              Show jobs without salary information
            </p>
          </div>
          <Switch
            checked={includeNotDisclosed}
            onCheckedChange={setIncludeNotDisclosed}
          />
        </div>

        {/* Minimum Salary */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Minimum Salary</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Amount ({minSalary.frequency === "yearly" ? "Lakhs" : "₹"})
              </Label>
              <Input
                type="text"
                placeholder={minSalary.frequency === "yearly" ? "e.g. 5" : "e.g. 50000"}
                value={minSalary.amount}
                onChange={(e) => handleAmountChange(e.target.value, minSalary.frequency, 'min')}
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Frequency</Label>
              <Select 
                value={minSalary.frequency} 
                onValueChange={(value) => handleFrequencyChange(value, 'min')}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Maximum Salary */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Maximum Salary</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Amount ({maxSalary.frequency === "yearly" ? "Lakhs" : "₹"})
              </Label>
              <Input
                type="text"
                placeholder={maxSalary.frequency === "yearly" ? "e.g. 10" : "e.g. 100000"}
                value={maxSalary.amount}
                onChange={(e) => handleAmountChange(e.target.value, maxSalary.frequency, 'max')}
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Frequency</Label>
              <Select 
                value={maxSalary.frequency} 
                onValueChange={(value) => handleFrequencyChange(value, 'max')}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Range Validation Message */}
        {!isValidRange() && (
          <p className="text-xs text-red-500">
            Maximum salary should be greater than minimum salary
          </p>
        )}

        {/* Current Range Display */}
        {(minSalary.amount || maxSalary.amount) && isValidRange() && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Current range:</p>
            <p className="text-sm font-medium">
              {minSalary.amount ? formatSalary(minSalary.amount, minSalary.frequency) : "Any"} 
              {" - "}
              {maxSalary.amount ? formatSalary(maxSalary.amount, maxSalary.frequency) : "Any"}
            </p>
          </div>
        )}

        {/* Clear Range Button */}
        {(minSalary.amount || maxSalary.amount) && (
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8"
            onClick={handleReset}
          >
            Clear Range
          </Button>
        )}
      </div>
    </div>
  );
};

export default SalaryFilter;