/**
 * Role Selector Component
 * Allows users to choose between Investor and Advisor roles during signup
 */

'use client'

import { UserCircle, BriefcaseIcon } from 'lucide-react'
import { UserRole } from '@/types/database.types'

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void
  selectedRole?: UserRole | null
}

export function RoleSelector({ onSelectRole, selectedRole }: RoleSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Fynly
        </h2>
        <p className="text-gray-600">
          Choose your account type to get started
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Investor Card */}
        <button
          onClick={() => onSelectRole('investor')}
          className={`
            relative p-6 rounded-xl border-2 transition-all duration-200
            hover:shadow-lg hover:scale-105 text-left
            ${
              selectedRole === 'investor'
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-blue-300'
            }
          `}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div
              className={`
                w-16 h-16 rounded-full flex items-center justify-center
                ${
                  selectedRole === 'investor'
                    ? 'bg-blue-500 text-white'
                    : 'bg-blue-100 text-blue-600'
                }
              `}
            >
              <UserCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                I'm an Investor
              </h3>
              <p className="text-sm text-gray-600">
                Looking for expert financial advice and guidance
              </p>
            </div>
            <ul className="text-xs text-gray-500 space-y-1 mt-4">
              <li>✓ Browse verified advisors</li>
              <li>✓ Book consultations</li>
              <li>✓ Get personalized advice</li>
            </ul>
          </div>
          {selectedRole === 'investor' && (
            <div className="absolute top-3 right-3">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
        </button>

        {/* Advisor Card */}
        <button
          onClick={() => onSelectRole('advisor')}
          className={`
            relative p-6 rounded-xl border-2 transition-all duration-200
            hover:shadow-lg hover:scale-105 text-left
            ${
              selectedRole === 'advisor'
                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-indigo-300'
            }
          `}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div
              className={`
                w-16 h-16 rounded-full flex items-center justify-center
                ${
                  selectedRole === 'advisor'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-indigo-100 text-indigo-600'
                }
              `}
            >
              <BriefcaseIcon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                I'm an Advisor
              </h3>
              <p className="text-sm text-gray-600">
                SEBI-registered professional offering financial services
              </p>
            </div>
            <ul className="text-xs text-gray-500 space-y-1 mt-4">
              <li>✓ Create professional profile</li>
              <li>✓ Manage consultations</li>
              <li>✓ Grow your client base</li>
            </ul>
          </div>
          {selectedRole === 'advisor' && (
            <div className="absolute top-3 right-3">
              <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

