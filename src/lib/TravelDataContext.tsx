import { createContext, useContext, type ReactNode } from 'react';
import { useReferenceData } from '../hooks/useReferenceData';
import { useVisits } from '../hooks/useVisits';
import { useWishlist } from '../hooks/useWishlist';
import { useCities, useCityVisits } from '../hooks/useCities';
import { useGoals } from '../hooks/useGoals';

type TravelDataValue = ReturnType<typeof useAssembledTravelData>;

const TravelDataContext = createContext<TravelDataValue | undefined>(undefined);

function useAssembledTravelData() {
  const referenceData = useReferenceData();
  const visitsData = useVisits();
  const wishlistData = useWishlist();
  const citiesData = useCities();
  const cityVisitsData = useCityVisits();
  const goalsData = useGoals();

  return {
    regions: referenceData.regions,
    countries: referenceData.countries,
    referenceLoading: referenceData.loading,
    referenceError: referenceData.error,

    visits: visitsData.visits,
    visitedCountryIds: visitsData.visitedCountryIds,
    visitsLoading: visitsData.loading,
    toggleVisit: visitsData.toggleVisit,

    wishlistItems: wishlistData.items,
    wishlistCountryIds: wishlistData.wishlistCountryIds,
    wishlistLoading: wishlistData.loading,
    toggleWishlist: wishlistData.toggleWishlist,

    cities: citiesData.cities,
    citiesLoading: citiesData.loading,

    cityVisits: cityVisitsData.cityVisits,
    visitedCityIds: cityVisitsData.visitedCityIds,
    cityVisitsLoading: cityVisitsData.loading,
    toggleCityVisit: cityVisitsData.toggleCityVisit,

    goals: goalsData.goals,
    goalsLoading: goalsData.loading,
    addGoal: goalsData.addGoal,
    deleteGoal: goalsData.deleteGoal,
  };
}

export function TravelDataProvider({ children }: { children: ReactNode }) {
  const value = useAssembledTravelData();
  return <TravelDataContext.Provider value={value}>{children}</TravelDataContext.Provider>;
}

export function useTravelData() {
  const ctx = useContext(TravelDataContext);
  if (!ctx) throw new Error('useTravelData must be used within TravelDataProvider');
  return ctx;
}
