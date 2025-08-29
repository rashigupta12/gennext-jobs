/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import React, { useState } from 'react';

// This component handles a salary range input and provides both the formatted string
// and the parsed numeric values for filtering
interface SalaryInputFieldProps {
  form: any; // Replace 'any' with the appropriate type if known
  name: string;
}

const SalaryInputField: React.FC<SalaryInputFieldProps> = ({ form, name }) => {
  const [minSalary, setMinSalary] = useState<number | null>(null);
  const [maxSalary, setMaxSalary] = useState<number | null>(null);

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Update the form with the formatted string value
    form.setValue(name, value);
    
    // Parse the string to extract numeric values for filtering
    const parsedValues = parseSalaryString(value);
    setMinSalary(parsedValues.min);
    setMaxSalary(parsedValues.max);
    
    // Optionally store these numeric values in separate form fields
    if (form.setValue) {
      form.setValue(`${name}_min`, parsedValues.min);
      form.setValue(`${name}_max`, parsedValues.max);
    }
  };

  // Parse a salary string like "$80,000 - $100,000" into numeric values
  const parseSalaryString = (salaryString: string) => {
    try {
      // Remove currency symbols and commas, then extract numbers
      const cleanedString = salaryString.replace(/[$,]/g, '');
      const numbers = cleanedString.match(/\d+/g);
      
      if (numbers && numbers.length >= 2) {
        return {
          min: parseInt(numbers[0], 10),
          max: parseInt(numbers[1], 10)
        };
      } else if (numbers && numbers.length === 1) {
        // Handle single number case (e.g. "$80,000")
        return {
          min: parseInt(numbers[0], 10),
          max: parseInt(numbers[0], 10)
        };
      }
    } catch (error) {
      console.error("Error parsing salary string:", error);
    }
    
    return { min: null, max: null };
  };

  return (
    <FormItem>
      <FormLabel>Salary</FormLabel>
      <FormControl>
        <Input 
          placeholder="e.g. $80,000 - $100,000" 
          value={form.watch(name) || ''}
          onChange={handleSalaryChange} 
        />
      </FormControl>
      <FormMessage />
      {/* Optionally display the parsed values for debugging */}
      {/* <div className="text-xs text-gray-500 mt-1">
        Min: {minSalary}, Max: {maxSalary}
      </div> */}
    </FormItem>
  );
};

export default SalaryInputField;