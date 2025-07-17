
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Clock, AlertTriangle, Users, Shield, Phone } from 'lucide-react';

interface LibraryPolicyProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

const LibraryPolicy = ({ onClose, showCloseButton = false }: LibraryPolicyProps) => {
  return (
    <div className="space-y-6">
      <Card className="border-none shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            Library Policy
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Welcome to our Community Library Management System
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Membership Requirements */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-700 dark:text-green-400">
              <Users className="h-5 w-5" />
              1. Membership Requirements
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Membership is available to <strong>all community members</strong>, from <strong>elementary school</strong> age to <strong>adult learners</strong></li>
              <li>• The <strong>minimum age</strong> to join is generally between <strong>6–8 years old</strong>, depending on reading ability and responsibility</li>
              <li>• Valid identification and proof of residence required for membership registration</li>
              <li>• Complete the <strong>Library Membership Application Form</strong> to get started</li>
            </ul>
          </div>

          {/* Borrowing Rules */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <BookOpen className="h-5 w-5" />
              2. Borrowing Rules
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Members may borrow <Badge variant="outline" className="mx-1">2 books at a time</Badge>, with permission for <Badge variant="outline" className="mx-1">up to 5 books</Badge> for advanced members</li>
              <li>• The <strong>standard borrowing period</strong> is <Badge variant="secondary" className="mx-1">14 days (2 weeks)</Badge></li>
              <li>• Members may <strong>renew a book up to 2 times</strong> online or in person, giving a <Badge variant="secondary" className="mx-1">maximum borrowing time of 6 weeks</Badge></li>
              <li>• Some materials are <strong>not available for borrowing</strong>, such as <strong>reference books, rare collections, and periodicals</strong></li>
            </ul>
          </div>

          {/* Returns & Overdue Items */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <Clock className="h-5 w-5" />
              3. Returns & Overdue Items
            </h3>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">Late fee structure:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Badge variant="destructive" className="text-center py-2">$0.50/day - First week</Badge>
                  <Badge variant="destructive" className="text-center py-2">$1.00/day - Second week</Badge>
                  <Badge variant="destructive" className="text-center py-2">$2.00/day - Beyond two weeks</Badge>
                </div>
              </div>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• A <strong>2-day grace period</strong> is provided for returns</li>
                <li>• If a book is <strong>overdue by 4 weeks</strong> without renewal, the member's <strong>account will be suspended</strong></li>
                <li>• Members with overdue items or unpaid fees cannot <strong>borrow additional materials</strong></li>
              </ul>
            </div>
          </div>

          {/* Material Care */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-400">
              <Shield className="h-5 w-5" />
              4. Material Care
            </h3>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-3">
              <p className="font-medium text-red-800 dark:text-red-400 mb-2">Prohibited actions:</p>
              <ul className="space-y-1 text-red-700 dark:text-red-300">
                <li>• Writing, marking, highlighting, or underlining in materials</li>
                <li>• Removing or damaging pages, covers, or binding</li>
                <li>• Exposing materials to food, drinks, or moisture</li>
              </ul>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              If a material is <strong>damaged or lost</strong>, the member's <strong>account will be charged</strong> the replacement cost and processing fee.
            </p>
          </div>

          {/* Library Conduct */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <AlertTriangle className="h-5 w-5" />
              5. Library Conduct
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Maintain a <strong>quiet environment</strong> to respect all users</li>
              <li>• Personal devices may be used with <strong>headphones or silent mode</strong></li>
              <li>• <strong>No food or beverages</strong> are allowed except in designated areas during special events</li>
              <li>• Treat all <strong>staff and fellow users with respect</strong> and courtesy</li>
              <li>• Violations may result in <Badge variant="destructive" className="mx-1">warnings</Badge> and potential <Badge variant="destructive" className="mx-1">membership suspension</Badge></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Questions or Concerns?
            </h3>
            <p className="text-blue-100">
              Please contact our library staff at the circulation desk <strong>or</strong> submit a <strong>feedback form</strong> through our online portal.

          <div className="mt-4">
            <a 
              href="/feedback" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              📝 Submit Feedback
            </a>
          </div>
            </p>
          </div>

          {showCloseButton && onClose && (
            <div className="flex justify-center pt-4">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                I Understand - Continue to Library
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LibraryPolicy;
