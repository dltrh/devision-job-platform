import React, { useState, useEffect } from "react";
import { getDialCodes } from "@/components/feature/CompanyProfile/api/CompanyProfileService";

interface PhoneInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  disabled?: boolean;
}

interface DialCode {
  code: string;
  name: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  fullWidth = false,
  disabled = false,
}) => {
  const [dialCodes, setDialCodes] = useState<DialCode[]>([]);
  const [isLoadingDialCodes, setIsLoadingDialCodes] = useState(true);

    // Fetch dial codes from backend
    useEffect(() => {
        const fetchDialCodes = async () => {
            try {
                setIsLoadingDialCodes(true);
                const codes = await getDialCodes();
                // Sort dial codes alphabetically by country name
                const sortedCodes = codes.sort((a, b) => a.name.localeCompare(b.name));
                setDialCodes(sortedCodes);
            } catch (error) {
                console.error("Failed to fetch dial codes:", error);
                // Fallback to default Vietnam dial code if fetch fails
                setDialCodes([{ code: "84", name: "Vietnam" }]);
            } finally {
                setIsLoadingDialCodes(false);
            }
        };

    fetchDialCodes();
  }, []);

  // Parse the phone number into country code and number
  const parsePhoneNumber = (
    phone: string,
  ): { countryCode: string; number: string } => {
    if (!phone || !phone.startsWith("+")) {
      return { countryCode: "84", number: "" }; // Default to Vietnam
    }

    const digits = phone.slice(1); // Remove the +

    // Find matching country code (check longer codes first)
    const sortedCodes = [...dialCodes].sort(
      (a, b) => b.code.length - a.code.length,
    );
    const matchedCountry = sortedCodes.find((c) => digits.startsWith(c.code));

    if (matchedCountry) {
      return {
        countryCode: matchedCountry.code,
        number: digits.slice(matchedCountry.code.length),
      };
    }

    return { countryCode: "84", number: digits };
  };

  const { countryCode: initialCode, number: initialNumber } =
    parsePhoneNumber(value);
  const [countryCode, setCountryCode] = useState(initialCode);
  const [number, setNumber] = useState(initialNumber);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Update internal state when value prop or dialCodes change
  useEffect(() => {
    if (dialCodes.length > 0) {
      const parsed = parsePhoneNumber(value);
      setCountryCode(parsed.countryCode);
      setNumber(parsed.number);
    }
  }, [value, dialCodes]);

  // Filter country codes based on search
  const filteredCountries = dialCodes.filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.includes(searchTerm),
  );

  const handleCountryCodeChange = (code: string) => {
    setCountryCode(code);
    setIsDropdownOpen(false);
    setSearchTerm("");
    // Update the full phone number
    onChange(`+${code}${number}`);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNumber = e.target.value.replace(/\D/g, ""); // Only digits
    setNumber(newNumber);
    // Update the full phone number
    onChange(`+${countryCode}${newNumber}`);
  };

  const selectedCountry = dialCodes.find((c) => c.code === countryCode);

  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        {/* Country Code Dropdown */}
        <div className="relative w-32">
          <button
            type="button"
            onClick={() =>
              !isLoadingDialCodes && setIsDropdownOpen(!isDropdownOpen)
            }
            disabled={disabled || isLoadingDialCodes}
            className={`w-full px-3 py-2 border rounded-lg text-left flex items-center justify-between ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            } ${disabled || isLoadingDialCodes ? "bg-gray-100 cursor-not-allowed" : "bg-white hover:border-gray-400 cursor-pointer"}`}
          >
            <span className="text-sm font-medium">
              {isLoadingDialCodes ? "..." : `+${countryCode}`}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div className="absolute z-20 mt-1 w-72 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                {/* Search Input */}
                <div className="p-2 border-b border-gray-200">
                  <input
                    type="text"
                    placeholder="Search country or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>

                {/* Country List */}
                <div className="overflow-y-auto max-h-64">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountryCodeChange(country.code)}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center justify-between ${
                          country.code === countryCode
                            ? "bg-blue-100 text-blue-900 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        <span>{country.name}</span>
                        <span className="text-gray-500 font-mono">
                          +{country.code}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                      No countries found
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="flex-1">
          <input
            type="tel"
            value={number}
            onChange={handleNumberChange}
            disabled={disabled}
            placeholder="123456789"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
          />
        </div>
      </div>

      {/* Helper Text or Error */}
      {(helperText || error) && (
        <p
          className={`mt-1 text-sm ${error ? "text-red-500" : "text-gray-500"}`}
        >
          {error || helperText}
        </p>
      )}

      {/* Selected Country Display */}
      {selectedCountry && !error && (
        <p className="mt-1 text-xs text-gray-400">
          {selectedCountry.name} (+{selectedCountry.code})
        </p>
      )}
    </div>
  );
};
