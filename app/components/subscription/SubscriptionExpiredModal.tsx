'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface SubscriptionExpiredModalProps {
  isOpen: boolean
  daysExpired?: number
}

export default function SubscriptionExpiredModal({
  isOpen,
  daysExpired = 0
}: SubscriptionExpiredModalProps) {
  const { language } = useLanguage()

  const translations = {
    en: {
      title: 'Subscription Expired',
      message: 'Your free trial has ended. Please activate a plan to continue using the system.',
      messageWithDays: 'Your subscription expired {{days}} days ago. Please activate a plan to continue.',
      limited: 'Limited Access Mode',
      limitedDesc: 'You can only access the subscription page until you activate a plan.',
      why: 'Why activate now?',
      benefit1: 'Continue managing your business',
      benefit2: 'Access all features and tools',
      benefit3: 'Keep your data secure',
      benefit4: 'Get support when you need it',
      viewPlans: 'View Plans & Activate',
      noCancel: 'This modal cannot be closed until you activate a subscription plan.',
    },
    sw: {
      title: 'Usajili Umeisha',
      message: 'Kipindi cha majaribio kimeisha. Tafadhali washa mpango kuendelea kutumia mfumo.',
      messageWithDays: 'Usajili wako uliisha siku {{days}} zilizopita. Tafadhali washa mpango kuendelea.',
      limited: 'Njia ya Ufikiaji Mdogo',
      limitedDesc: 'Unaweza tu kufikia ukurasa wa usajili mpaka uamue mpango.',
      why: 'Kwanini washa sasa?',
      benefit1: 'Endelea kusimamia biashara yako',
      benefit2: 'Fikia vipengele na zana zote',
      benefit3: 'Weka data yako salama',
      benefit4: 'Pata msaada unapohitaji',
      viewPlans: 'Angalia Mipango & Washa',
      noCancel: 'Modal hii haiwezi kufungwa mpaka uwashe mpango wa usajili.',
    },
  }

  const t = translations[language]

  const handleViewPlans = () => {
    // Use window.location for hard navigation to ensure it always works
    window.location.href = '/admin/subscription'
  }

  const getMessage = () => {
    if (daysExpired > 0) {
      return t.messageWithDays.replace('{{days}}', daysExpired.toString())
    }
    return t.message
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {}} // Cannot close
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <ExclamationTriangleIcon className="w-10 h-10 text-red-600" />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-bold text-gray-900 mb-2"
                  >
                    {t.title}
                  </Dialog.Title>
                  <p className="text-gray-600">{getMessage()}</p>
                </div>

                {/* Limited access notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm font-semibold text-yellow-900 mb-1">
                    {t.limited}
                  </p>
                  <p className="text-sm text-yellow-700">{t.limitedDesc}</p>
                </div>

                {/* Benefits */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    {t.why}
                  </p>
                  <ul className="space-y-2">
                    {[t.benefit1, t.benefit2, t.benefit3, t.benefit4].map(
                      (benefit, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-sm text-gray-600"
                        >
                          <svg
                            className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {benefit}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Action button */}
                <button
                  onClick={handleViewPlans}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
                >
                  {t.viewPlans}
                </button>

                {/* Cannot close notice */}
                <p className="text-xs text-center text-gray-500 mt-4">
                  {t.noCancel}
                </p>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

