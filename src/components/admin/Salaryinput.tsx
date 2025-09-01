
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";

interface SalaryInputFieldProps {
  form: UseFormReturn<any>;
  name: string;
}

const SalaryInputField: React.FC<SalaryInputFieldProps> = ({ form, name }) => {
  const [isNotDisclosed, setIsNotDisclosed] = useState(false);
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");

  // Parse existing salary value on component mount
  useEffect(() => {
    const currentSalary = form.getValues(name);
    if (currentSalary) {
      if (currentSalary.toLowerCase().includes("not disclosed")) {
        setIsNotDisclosed(true);
        setAmount("");
        setFrequency("monthly");
      } else {
        // Parse LPA format like "5LPA" or "6.5LPA"
        const lpaMatch = currentSalary.match(/(\d+(?:\.\d+)?)LPA/i);
        if (lpaMatch) {
          const lpaAmount = parseFloat(lpaMatch[1]) * 100000;
          setAmount(lpaAmount.toString());
          setFrequency("yearly");
        } else {
          // Parse existing salary format like "Rs. 15000/month" or "Rs. 150000/quarter"
          const rsMatch = currentSalary.match(/Rs\.\s*(\d+(?:,\d{3})*)\/(month|quarter)/i);
          if (rsMatch) {
            setAmount(rsMatch[1].replace(/,/g, ""));
            setFrequency(rsMatch[2].toLowerCase() === "month" ? "monthly" : "quarterly");
          }
        }
      }
    }
  }, [form, name]);

  // Update form value when inputs change
  useEffect(() => {
    if (isNotDisclosed) {
      form.setValue(name, "Not disclosed");
    } else if (amount && frequency) {
      const numericAmount = parseInt(amount);
      let formattedSalary = "";
      
      if (frequency === "yearly") {
        // Convert to LPA format for yearly salaries
        const lpaValue = parseFloat(amount);
        formattedSalary = `${lpaValue}LPA`;
      } else {
        const formattedAmount = numericAmount.toLocaleString('en-IN');
        const frequencyMap = {
          monthly: "month",
          quarterly: "quarter"
        };
        formattedSalary = `Rs. ${formattedAmount}/${frequencyMap[frequency as keyof typeof frequencyMap]}`;
      }
      
      form.setValue(name, formattedSalary);
    } else {
      form.setValue(name, "");
    }
  }, [isNotDisclosed, amount, frequency, form, name]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (frequency === "yearly") {
      // Allow numbers and decimal point for LPA format
      const value = e.target.value.replace(/[^\d.]/g, "");
      // Ensure only one decimal point
      const parts = value.split(".");
      const formattedValue = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : value;
      setAmount(formattedValue);
    } else {
      // Only allow numbers for monthly/quarterly
      const value = e.target.value.replace(/\D/g, "");
      setAmount(value);
    }
  };

  const handleNotDisclosedToggle = (checked: boolean) => {
    setIsNotDisclosed(checked);
    if (checked) {
      setAmount("");
      setFrequency("monthly");
    }
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Salary</FormLabel>
          <div className="space-y-3">
            {/* Not Disclosed Toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-normal">Not disclosed</FormLabel>
                <p className="text-xs text-muted-foreground">
                  Hide salary information from candidates
                </p>
              </div>
              <Switch
                checked={isNotDisclosed}
                onCheckedChange={handleNotDisclosedToggle}
              />
            </div>

            {/* Salary Input Fields */}
            {!isNotDisclosed && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FormLabel className="text-sm">
                    Amount ({frequency === "yearly" ? "Lakhs" : "₹"})
                  </FormLabel>
                  <Input
                    type="text"
                    placeholder={frequency === "yearly" ? "e.g. 5 (for 5LPA)" : "e.g. 50000"}
                    value={amount}
                    onChange={handleAmountChange}
                  />
                </div>
                <div>
                  <FormLabel className="text-sm">Frequency</FormLabel>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
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
            )}

            {/* Hidden input for form validation */}
            <FormControl>
              <Input
                type="hidden"
                {...field}
              />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SalaryInputField;