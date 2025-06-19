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
            Welcome to our Library Management System
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
              <li>• Membership is available to <strong>all church members</strong>, from <strong>primary school</strong> age to <strong>university graduation</strong></li>
              <li>• The <strong>minimum age</strong> to join is generally between <strong>6–8 years old</strong>, depending on reading ability and responsibility</li>
              <li>• No documents are needed — just fill out the <strong>Library Membership Form</strong></li>
            </ul>
          </div>

          {/* Borrowing Rules */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <BookOpen className="h-5 w-5" />
              2. Borrowing Rules
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• Members may borrow <Badge variant="outline" className="mx-1">1 book at a time</Badge>, with permission for <Badge variant="outline" className="mx-1">up to 3 books</Badge> in special cases</li>
              <li>• The <strong>standard borrowing period</strong> is <Badge variant="secondary" className="mx-1">7 days (1 week)</Badge></li>
              <li>• Members may <strong>renew a book up to 3 times</strong> in person, giving a <Badge variant="secondary" className="mx-1">maximum borrowing time of 3 weeks</Badge></li>
              <li>• Some books are <strong>not available for borrowing</strong>, such as <strong>rare, old, or reference-only books</strong></li>
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
                <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">Progressive fine system:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Badge variant="destructive" className="text-center py-2">1 EGP/day - First week</Badge>
                  <Badge variant="destructive" className="text-center py-2">3 EGP/day - Second week</Badge>
                  <Badge variant="destructive" className="text-center py-2">5 EGP/day - Third week</Badge>
                </div>
              </div>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                <li>• No <strong>grace period</strong> is offered, as members are notified of upcoming due dates</li>
                <li>• If a book is <strong>overdue by 3 weeks</strong> without renewal, the member's <strong>account will be frozen immediately</strong></li>
                <li>• Members with overdue books or unpaid fines are <strong>not allowed to borrow additional books</strong></li>
              </ul>
            </div>
          </div>

          {/* Book Care */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-400">
              <Shield className="h-5 w-5" />
              4. Book Care
            </h3>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-3">
              <p className="font-medium text-red-800 dark:text-red-400 mb-2">It is strictly forbidden to:</p>
              <ul className="space-y-1 text-red-700 dark:text-red-300">
                <li>• Write, mark, highlight, or underline in books</li>
                <li>• Cut or remove any pages</li>
                <li>• Mutilate or damage books in any way</li>
              </ul>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              If a book is <strong>damaged or lost</strong>, the member's <strong>account will be frozen</strong> until the applied fine is paid or the case is reviewed.
            </p>
          </div>

          {/* Library Behavior */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <AlertTriangle className="h-5 w-5" />
              5. Library Behavior
            </h3>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              <li>• The library must always remain <strong>as quiet as possible</strong> to respect readers</li>
              <li>• Use of <strong>phones and laptops is allowed</strong>, provided users remain calm and respectful</li>
              <li>• <strong>No food or drink</strong> is allowed inside the library <strong>except during official coffee breaks</strong></li>
              <li>• It is <strong>strictly forbidden to assault, disrespect, or argue with library staff</strong></li>
              <li>• Behavioral violations will result in <Badge variant="destructive" className="mx-1">warnings</Badge> and potential <Badge variant="destructive" className="mx-1">membership freezing</Badge></li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Problems or Questions?
            </h3>
            <p className="text-blue-100">
              Please contact the librarian directly <strong>or</strong> fill out the <strong>feedback form</strong> available on the library's website.

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