'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { LockClosedIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface FeatureLockedModalProps {
  isOpen: boolean
  onClose: () => void
  featureName: string
  requiredPlan: string
  currentPlan: string
  onUpgrade: () => void
}

export default function FeatureLockedModal({
  isOpen,
  onClose,
  featureName,
  requiredPlan,
  currentPlan,
  onUpgrade
}: FeatureLockedModalProps) {
  const { language } = useLanguage()

  const translations = {
    en: {
      title: 'Feature Locked',
      message: 'This feature requires a higher subscription plan',
      feature: 'Feature',
      currentPlanLabel: 'Your Current Plan',
      requiredPlanLabel: 'Required Plan',
      benefits: 'Benefits of upgrading:',
      benefit1: 'Access to',
      benefit2: 'Unlock advanced features',
      benefit3: 'Priority support',
      benefit4: 'Enhanced business tools',
      upgradeNow: 'Upgrade Now',
      cancel: 'Cancel',
      orHigher: 'or higher',
    },
    sw: {
      title: 'Kipengele Kimefungwa',
      message: 'Kipengele hiki kinahitaji mpango wa juu zaidi',
      feature: 'Kipengele',
      currentPlanLabel: 'Mpango Wako wa Sasa',
      requiredPlanLabel: 'Mpango Unaohitajika',
      benefits: 'Manufaa ya kupandisha:',
      benefit1: 'Ufikiaji wa',
      benefit2: 'Fungua vipengele vya kina',
      benefit3: 'Msaada wa kipaumbele',
      benefit4: 'Zana bora za biashara',
      upgradeNow: 'Panda Sasa',
      cancel: 'Ghairi',
      orHigher: 'au zaidi',
    },
  }

  const t = translations[language]

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <LockClosedIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold text-gray-900"
                      >
                        {t.title}
                      </Dialog.Title>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Message */}
                <p className="text-sm text-gray-600 mb-4">{t.message}</p>

                {/* Feature info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      {t.feature}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {featureName}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {t.currentPlanLabel}
                      </p>
                      <p className="text-sm font-semibold text-gray-700">
                        {currentPlan}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        {t.requiredPlanLabel}
                      </p>
                      <p className="text-sm font-semibold text-teal-600">
                        {requiredPlan} {t.orHigher}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    {t.benefits}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <svg
                        className="w-5 h-5 text-teal-600 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t.benefit1} {featureName}
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <svg
                        className="w-5 h-5 text-teal-600 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t.benefit2}
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <svg
                        className="w-5 h-5 text-teal-600 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {t.benefit3}
                    </li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={() => {
                      onUpgrade()
                      onClose()
                    }}
                    className="flex-1 px-4 py-2 bg-teal-600 rounded-lg text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
                  >
                    {t.upgradeNow}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

