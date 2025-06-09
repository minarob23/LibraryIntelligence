import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MembershipForm from '@/components/forms/membership-form';
import LibraryPolicy from '@/components/ui/library-policy';
import library1 from '@/assets/library-images/library1.svg';
import library2 from '@/assets/library-images/library2.svg';
import student1 from '@/assets/student-images/student1.svg';
import student2 from '@/assets/student-images/student2.svg';

const MembershipPage = () => {
  return (
    <div className="animate-fade-in min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      

      <div className="container mx-auto px-4">
        <Tabs defaultValue="membership" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-2">
            <TabsTrigger value="membership" className="rounded-lg py-3 text-lg font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-200">
              Membership Registration
            </TabsTrigger>
            <TabsTrigger value="policy" className="rounded-lg py-3 text-lg font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-teal-500 data-[state=active]:text-white transition-all duration-200">
              Library Policy
            </TabsTrigger>
          </TabsList>

        <TabsContent value="membership">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Membership Form */}
            <div>
              <MembershipForm />
            </div>

            {/* Benefits and Info */}
            <div className="space-y-6">
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Membership Benefits
                  </CardTitle>
                  <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-2 rounded-full"></div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {[
                      { icon: "📚", text: "Access to our extensive book collection" },
                      { icon: "💻", text: "Digital resources and e-books" },
                      { icon: "🏛️", text: "Study spaces and quiet reading areas" },
                      { icon: "👨‍🏫", text: "Research assistance from our librarians" },
                      { icon: "🎓", text: "Participation in library events and workshops" },
                      { icon: "⏰", text: "Extended borrowing privileges" }
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
                        <span className="text-2xl">{benefit.icon}</span>
                        <span className="text-gray-700 dark:text-gray-300">{benefit.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Library Hours</h3>
                  <div className="space-y-2">
                    {Object.entries(JSON.parse(localStorage.getItem('libraryHours') || '{}')).map(([day, hours]: [string, any]) => (
                      <div key={day} className="flex justify-between">
                        <span className="capitalize">{day}</span>
                        <span>{hours.open === 'Closed' ? 'Closed' : `${hours.open} - ${hours.close}`}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-0 overflow-hidden">
                  <div className="grid grid-cols-2 gap-1">
                    <img src={library1} alt="Library interior" className="w-full h-32 object-cover" />
                    <img src={student1} alt="Student reading" className="w-full h-32 object-cover" />
                    <img src={library2} alt="Library shelves" className="w-full h-32 object-cover" />
                    <img src={student2} alt="Group studying" className="w-full h-32 object-cover" />
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