'use client'
import { Phone } from "lucide-react";
import { useState } from "react";

export const CustomIndianPhoneInput = ({ value, onChange, placeholder }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const [phoneNumber, setPhoneNumber] = useState(() => {
    if (!value) return '';
    const cleanNumber = value.replace(/\D/g, '');
    if (cleanNumber.startsWith('91') && cleanNumber.length === 12) {
      return cleanNumber.substring(2);
    }
    return cleanNumber.length === 10 ? cleanNumber : '';
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Limit to 10 digits max
    if (inputValue.length > 10) {
      inputValue = inputValue.slice(0, 10);
    }
    
    // Validate first digit (must be 6-9)
    if (inputValue.length > 0 && !['6', '7', '8', '9'].includes(inputValue[0])) {
      return; // Don't update if first digit is invalid
    }
    
    setPhoneNumber(inputValue);
    onChange(inputValue ? `+91${inputValue}` : '');
  };

  const formatDisplayNumber = (number: string) => {
    if (number.length >= 6) {
      return `${number.slice(0, 5)} ${number.slice(5)}`;
    }
    return number;
  };

  return (
    <div className="relative">
      <div className="relative group">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-gennext transition-colors z-10" />
        <div className="flex h-11 rounded-xl border-2 border-gray-200  bg-gray-50/50 hover:bg-white transition-all duration-200">
          <div className="flex items-center px-3 border-r border-gray-200 bg-gray-100/50 rounded-l-xl ml-10">
            <span className="text-lg mr-2">🇮🇳</span>
            <span className="text-sm font-medium text-gray-700">+91</span>
          </div>
          <input
            type="tel"
            value={formatDisplayNumber(phoneNumber)}
            onChange={handlePhoneChange}
            placeholder={placeholder || "Enter mobile number"}
            className="flex-1 px-3 py-2 bg-transparent border-none focus:outline-none text-sm"
            maxLength={11} // Accounting for space in formatting
          />
        </div>
      </div>
      {phoneNumber.length > 0 && phoneNumber.length < 10 && (
        <div className="text-xs text-orange-500 mt-1">
          Enter {10 - phoneNumber.length} more digits
        </div>
      )}
      {/* {phoneNumber.length === 0 && (
        <div className="text-xs text-gray-500 mt-1">
          Enter 10 digits 
        </div>
      )} */}
    </div>
  );
};
