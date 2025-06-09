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
    <div className="animate-fade-in">
      <div className="mb-6 animate-slide-up">
        <h2 className="text-2xl font-bold">Library Membership System</h2>
        <p className="text-gray-600 dark:text-gray-400">Join our community and explore our library policies</p>
      </div>

      <Tabs defaultValue="membership" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="membership">Membership Registration</TabsTrigger>
          <TabsTrigger value="policy">Library Policy</TabsTrigger>
        </TabsList>

        <TabsContent value="membership">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Membership Form */}
            <div>
              <MembershipForm />
            </div>

            {/* Benefits and Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Membership Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                    <li>• Access to our extensive book collection</li>
                    <li>• Digital resources and e-books</li>
                    <li>• Study spaces and quiet reading areas</li>
                    <li>• Research assistance from our librarians</li>
                    <li>• Participation in library events and workshops</li>
                    <li>• Extended borrowing privileges</li>
                  </ul>
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
  );
};

export default MembershipPage;