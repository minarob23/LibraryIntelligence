
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MembershipForm from '@/components/forms/membership-form';
import LibraryPolicy from '@/components/ui/library-policy';
import { BookOpen, Clock, Users, Shield, Heart, Star } from 'lucide-react';
import library1 from '@/assets/library-images/library1.svg';
import library2 from '@/assets/library-images/library2.svg';
import student1 from '@/assets/student-images/student1.svg';
import student2 from '@/assets/student-images/student2.svg';

const MembershipPage = () => {
  return (
    <div className="animate-fade-in min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="membership" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-2">
            <TabsTrigger value="membership" className="rounded-lg py-3 text-lg font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-200">
              📝 Membership Registration
            </TabsTrigger>
            <TabsTrigger value="policy" className="rounded-lg py-3 text-lg font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all duration-200">
              📋 Library Policy
            </TabsTrigger>
          </TabsList>

        <TabsContent value="membership">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Membership Form - Takes 2 columns */}
            <div className="xl:col-span-2">
              <MembershipForm />
            </div>

            {/* Sidebar with Benefits and Info - Takes 1 column */}
            <div className="space-y-6">
              {/* Compact Benefits Card */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Why Join Us?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: <BookOpen className="h-4 w-4 text-blue-500" />, text: "Extensive book collection" },
                    { icon: <Clock className="h-4 w-4 text-green-500" />, text: "Extended borrowing time" },
                    { icon: <Users className="h-4 w-4 text-purple-500" />, text: "Reading recommendations" },
                    { icon: <Shield className="h-4 w-4 text-orange-500" />, text: "Priority book reservations" },
                    { icon: <Star className="h-4 w-4 text-yellow-500" />, text: "Digital resources" }
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
                      {benefit.icon}
                      <span className="text-sm text-gray-700 dark:text-gray-300">{benefit.text}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-emerald-900">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-3 text-center text-emerald-700 dark:text-emerald-400">Library at a Glance</h3>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">500+</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Books</div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">100+</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Members</div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">24/7</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Access</div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">FREE</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Membership</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              

              {/* Image Gallery - Compact */}
              <Card className="shadow-lg border-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 gap-1">
                    <img src={library1} alt="Library interior" className="w-full h-20 object-cover hover:scale-105 transition-transform duration-200" />
                    <img src={student1} alt="Student reading" className="w-full h-20 object-cover hover:scale-105 transition-transform duration-200" />
                    <img src={library2} alt="Library shelves" className="w-full h-20 object-cover hover:scale-105 transition-transform duration-200" />
                    <img src={student2} alt="Group studying" className="w-full h-20 object-cover hover:scale-105 transition-transform duration-200" />
                  </div>
                </CardContent>
              </Card>

              {/* Call to Action */}
              <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <CardContent className="p-4 text-center">
                  <h3 className="text-lg font-bold mb-2">Ready to Join?</h3>
                  <p className="text-blue-100 text-sm mb-3">
                    Fill out the form and become part of our learning community today!
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-300" />
                    <span>100% Free Registration</span>
                    <Star className="h-4 w-4 text-yellow-300" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="policy">
          <LibraryPolicy />
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MembershipPage;
