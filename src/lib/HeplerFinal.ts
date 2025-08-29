export const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
    };
    return checks;
  };


    export const calculatePasswordStrength = (password: string): number => {
      let strength = 0;
      if (password.length >= 6) strength += 25;
      if (password.length >= 8) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 25;
      return strength;
    };
  
    export const getStrengthColor = (strength: number): string => {
      if (strength < 25) return '#ef4444';
      if (strength < 50) return '#f59e0b';
      if (strength < 75) return '#eab308';
      return '#10b981';
    };
  
    export const getStrengthText = (strength: number): string => {
      if (strength < 25) return 'Weak';
      if (strength < 50) return 'Fair';
      if (strength < 75) return 'Good';
      return 'Strong';
    };
  