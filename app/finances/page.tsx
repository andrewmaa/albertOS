'use client'

import { useState } from 'react'
import { Sidebar } from "@/app/components/sidebar"
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/card"

type Tab = 'overview' | 'tuition' | 'aid' | 'history'

export default function FinancesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'tuition', label: 'Tuition & Fees' },
    { id: 'aid', label: 'Financial Aid' },
    { id: 'history', label: 'Payment History' }
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentPage="/finances" />
      <div className="flex-1 overflow-hidden w-full">
        <div className="p-4 lg:p-8 h-screen flex flex-col pt-16 lg:pt-8">
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex justify-between items-center h-[40px] mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold">
                My <span className="bg-[#34C759] text-white px-2 py-1 rounded-md">Finances</span>
              </h1>
              <div className="w-[40px]"></div>
            </div>
            <p className="text-gray-600 mb-8">
              Manage your tuition, fees, financial aid, and payment history.
            </p>

            {/* Tabs */}
            <div className="flex space-x-1 border-b border-gray-200 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
                    ${activeTab === tab.id
                      ? 'bg-white text-[#34C759] border-t border-x border-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-[#8900E1]">$24,500.00</div>
                      <p className="text-sm text-gray-500 mt-2">Due by August 15, 2024</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Aid</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-[#34C759]">$18,000.00</div>
                      <p className="text-sm text-gray-500 mt-2">Awarded for Fall 2024</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'tuition' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Fall 2024 Tuition Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Tuition</span>
                          <span className="font-medium">$27,000.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Technology Fee</span>
                          <span className="font-medium">$500.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Student Activity Fee</span>
                          <span className="font-medium">$100.00</span>
                        </div>
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center font-bold">
                            <span>Total</span>
                            <span>$27,600.00</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'aid' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Financial Aid Awards</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">NYU Scholarship</span>
                          <span className="font-medium text-[#34C759]">$12,000.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Federal Grant</span>
                          <span className="font-medium text-[#34C759]">$6,000.00</span>
                        </div>
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center font-bold">
                            <span>Total Aid</span>
                            <span className="text-[#34C759]">$18,000.00</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">Spring 2024 Payment</div>
                            <div className="text-sm text-gray-500">Jan 15, 2024</div>
                          </div>
                          <span className="font-medium">$24,500.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">Fall 2023 Payment</div>
                            <div className="text-sm text-gray-500">Aug 15, 2023</div>
                          </div>
                          <span className="font-medium">$24,500.00</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
