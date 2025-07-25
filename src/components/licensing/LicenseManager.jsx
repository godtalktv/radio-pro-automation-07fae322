import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { License } from '@/api/entities';
import { Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils'; // Import the utility to create page URLs

const LicenseContext = createContext(null);

export const useLicense = () => {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error('useLicense must be used within a LicenseProvider');
  }
  return context;
};

export const LicenseProvider = ({ children }) => {
  const [license, setLicense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const validateAndSetLicense = useCallback(async () => {
    // If the user is already on the pricing page, don't do anything to avoid a redirect loop.
    if (window.location.pathname.includes(createPageUrl('Pricing'))) {
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const licenses = await License.list('', 1);
      
      // Check if a license exists and its status is 'active'.
      if (licenses && licenses.length > 0 && licenses[0].status === 'active') {
        // License is valid, allow access to the app.
        setLicense(licenses[0]);
      } else {
        // If no license is found, or it's not active (e.g., trial, expired), redirect to the pricing page.
        console.warn("No active license found or license is inactive. Redirecting to purchase.");
        window.location.href = createPageUrl('Pricing');
        return; // Stop further execution to prevent a flash of content
      }
    } catch (err) {
      console.error("License check failed:", err);
      setError(`License check failed: ${err.message}`);
      // On any error during the check, also redirect to be safe.
      window.location.href = createPageUrl('Pricing');
      return;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    validateAndSetLicense();
  }, [validateAndSetLicense]);

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        <p className="text-slate-400 mt-4">Validating License...</p>
      </div>
    );
  }
  
  const value = { license, isLoading, error, refreshLicense: validateAndSetLicense };

  return (
    <LicenseContext.Provider value={value}>
      {children}
    </LicenseContext.Provider>
  );
};