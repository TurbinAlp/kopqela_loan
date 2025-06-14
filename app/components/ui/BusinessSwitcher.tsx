'use client'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, ChevronUpDownIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { useBusiness } from '../../contexts/BusinessContext'
import { useLanguage } from '../../contexts/LanguageContext'

export default function BusinessSwitcher() {
  const { currentBusiness, businesses, setCurrentBusiness, isLoading } = useBusiness()
  const { language } = useLanguage()
  
  // Debug logging
  console.log('BusinessSwitcher - currentBusiness:', currentBusiness)
  console.log('BusinessSwitcher - businesses:', businesses)

  const translations = {
    en: {
      selectBusiness: 'Select Business',
      noBusiness: 'No businesses available',
      loading: 'Loading...'
    },
    sw: {
      selectBusiness: 'Chagua Biashara',
      noBusiness: 'Hakuna biashara',
      loading: 'Inapakia...'
    }
  }

  const t = translations[language]

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
        <span>{t.loading}</span>
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-500">
        <BuildingOfficeIcon className="h-4 w-4" />
        <span>{t.noBusiness}</span>
      </div>
    )
  }

  if (businesses.length === 1) {
    // If only one business, just show it without dropdown
    return (
      <div className="flex items-center space-x-2 px-3 py-2 text-sm">
        <BuildingOfficeIcon className="h-4 w-4 text-teal-600" />
        <span className="font-medium text-gray-900 truncate">
          {currentBusiness?.name || businesses[0].name}
        </span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xs">
      <Listbox value={currentBusiness} onChange={setCurrentBusiness}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm">
            <div className="flex items-center space-x-2">
              <BuildingOfficeIcon className="h-4 w-4 text-teal-600 flex-shrink-0" />
              <span className="block truncate font-medium text-gray-900">
                {currentBusiness?.name || t.selectBusiness}
              </span>
            </div>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {businesses.map((business) => (
                <Listbox.Option
                  key={business.id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-teal-100 text-teal-900' : 'text-gray-900'
                    }`
                  }
                  value={business}
                >
                  {({ selected }) => (
                    <>
                      <div className="flex items-center space-x-2">
                        <BuildingOfficeIcon className="h-4 w-4 text-gray-900 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span
                            className={`block truncate text-gray-900 ${
                              selected ? 'font-medium' : 'font-normal'
                            }`}
                          >
                            {business.name}
                          </span>
                          <span className="text-xs text-gray-900 ">
                            {business.businessType}
                          </span>
                        </div>
                      </div>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-teal-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
} 