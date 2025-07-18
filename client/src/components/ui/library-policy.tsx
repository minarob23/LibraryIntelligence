
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
            Library Policy - سياسة المكتبة
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Welcome to our Church Library Management System - أهلاً بكم في نظام إدارة مكتبة الكنيسة
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Membership Requirements */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-700 dark:text-green-400">
              <Users className="h-5 w-5" />
              ١. شروط العضوية - 1. Membership Requirements
            </h3>
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">العربية:</h4>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300" style={{ direction: 'rtl', textAlign: 'right' }}>
                  <li>• العضوية متاحة <strong>لكافة أعضاء الكنيسة</strong>، من <strong>المرحلة الابتدائية</strong> وحتى <strong>الخريجيين</strong></li>
                  <li>• الحد الأدنى للسن <strong>7 سنوات</strong>، حسب قدرة الطفل على القراءة وتحمله للمسؤولية</li>
                  <li>• لا يُطلب تقديم أي مستندات — فقط تعبئة <strong>استمارة العضوية</strong> في المكتبة</li>
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">English:</h4>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Membership is available to <strong>all church members</strong>, from <strong>primary school</strong> age to <strong>university graduation</strong></li>
                  <li>• The <strong>minimum age</strong> to join is generally <strong>7 years old</strong>, depending on reading ability and responsibility</li>
                  <li>• No documents are needed — just fill out the <strong>Library Membership Form</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Borrowing Rules */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <BookOpen className="h-5 w-5" />
              ٢. قواعد الاستعارة - 2. Borrowing Rules
            </h3>
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">العربية:</h4>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300" style={{ direction: 'rtl', textAlign: 'right' }}>
                  <li>• يمكن للعضو استعارة <Badge variant="outline" className="mx-1">كتاب واحد فقط</Badge> في كل مرة، مع إمكانية الاستعارة حتى <Badge variant="outline" className="mx-1">٣ كتب</Badge> في بعض الحالات الخاصة</li>
                  <li>• <strong>مدة الاستعارة</strong> هي <Badge variant="secondary" className="mx-1">٧ أيام (أسبوع واحد)</Badge></li>
                  <li>• يُمكن تجديد استعارة الكتاب <strong>حتى ٣ مرات</strong> بالحضور شخصيًا، لتصل <Badge variant="secondary" className="mx-1">أقصى مدة استعارة إلى ٣ أسابيع</Badge></li>
                  <li>• بعض الكتب <strong>غير متاحة للاستعارة</strong> (مقتصرة على القراءة الداخلية)، كالمراجع، والكتب القديمة أو النادرة</li>
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">English:</h4>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• Members may borrow <Badge variant="outline" className="mx-1">1 book at a time</Badge>, with permission for <Badge variant="outline" className="mx-1">up to 3 books</Badge> in special cases</li>
                  <li>• The <strong>standard borrowing period</strong> is <Badge variant="secondary" className="mx-1">7 days (1 week)</Badge></li>
                  <li>• Members may <strong>renew a book up to 3 times</strong> in person, giving a <Badge variant="secondary" className="mx-1">maximum borrowing time of 3 weeks</Badge></li>
                  <li>• Some books are <strong>not available for borrowing</strong>, such as <strong>rare, old, or reference-only books</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Returns & Overdue Items */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <Clock className="h-5 w-5" />
              ٣. الإرجاع والكتب المتأخرة - 3. Returns & Overdue Items
            </h3>
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">العربية:</h4>
                <div className="space-y-3" style={{ direction: 'rtl', textAlign: 'right' }}>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">يُطبق نظام غرامات مركبة على الكتب المتأخرة:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Badge variant="destructive" className="text-center py-2">١ جنيه/يوم - الأسبوع الأول</Badge>
                      <Badge variant="destructive" className="text-center py-2">٣ جنيه/يوم - الأسبوع الثاني</Badge>
                      <Badge variant="destructive" className="text-center py-2">٥ جنيه/يوم - الأسبوع الثالث</Badge>
                    </div>
                  </div>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• لا توجد <strong>فترة سماح</strong>، إذ يتم إخطار الأعضاء بتاريخ الاستحقاق مسبقًا</li>
                    <li>• إذا تأخر الكتاب <strong>لمدة ٣ أسابيع دون تجديد</strong>، يتم <strong>تجميد عضوية العضو فورًا</strong></li>
                    <li>• لا يُسمح باستعارة كتب إضافية في حال وجود <strong>كتب متأخرة أو غرامات غير مسددة</strong></li>
                  </ul>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">English:</h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">A progressive fine system applies to overdue books:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Badge variant="destructive" className="text-center py-2">1 EGP/day - First week</Badge>
                      <Badge variant="destructive" className="text-center py-2">3 EGP/day - Second week</Badge>
                      <Badge variant="destructive" className="text-center py-2">5 EGP/day - Third week</Badge>
                    </div>
                  </div>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li>• No <strong>grace period</strong> is offered, as members are notified of upcoming due dates</li>
                    <li>• If a book is <strong>overdue by 3 weeks</strong> without renewal, the member's <strong>account will be frozen immediately</strong></li>
                    <li>• Members with <strong>overdue books or unpaid fines</strong> are <strong>not allowed to borrow additional books</strong></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Material Care */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-700 dark:text-purple-400">
              <Shield className="h-5 w-5" />
              ٤. العناية بالكتب - 4. Book Care
            </h3>
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="mb-3">
                  <p className="font-medium text-red-800 dark:text-red-400 mb-2" style={{ direction: 'rtl', textAlign: 'right' }}>يُمنع منعًا باتًا:</p>
                  <ul className="space-y-1 text-red-700 dark:text-red-300" style={{ direction: 'rtl', textAlign: 'right' }}>
                    <li>• الكتابة أو التعليم أو التسطير داخل الكتب</li>
                    <li>• قص أو نزع الصفحات</li>
                    <li>• تمزيق أو إتلاف الكتب بأي صورة</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-red-800 dark:text-red-400 mb-2">Prohibited actions:</p>
                  <ul className="space-y-1 text-red-700 dark:text-red-300">
                    <li>• Writing, marking, highlighting, or underlining in books</li>
                    <li>• Cutting or removing any pages</li>
                    <li>• Mutilating or damaging books in any way</li>
                  </ul>
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-gray-700 dark:text-gray-300 mb-2" style={{ direction: 'rtl', textAlign: 'right' }}>
                  في حال <strong>إتلاف أو فقدان كتاب</strong>، يتم <strong>تجميد عضوية العضو</strong> لحين دفع الغرامة المقررة
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  If a book is <strong>damaged or lost</strong>, the member's <strong>account will be frozen</strong> until the applied fine is paid
                </p>
              </div>
            </div>
          </div>

          {/* Library Conduct */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <AlertTriangle className="h-5 w-5" />
              ٥. السلوك داخل المكتبة - 5. Library Behavior
            </h3>
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">العربية:</h4>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300" style={{ direction: 'rtl', textAlign: 'right' }}>
                  <li>• يُطلب من الجميع <strong>الهدوء التام</strong> احترامًا للقراء وحفاظًا على التركيز</li>
                  <li>• يُسمح باستخدام <strong>الهواتف المحمولة وأجهزة الحاسوب المحمولة</strong>، بشرط الالتزام بالهدوء</li>
                  <li>• <strong>يُمنع إدخال الطعام أو الشراب</strong> داخل المكتبة، <strong>باستثناء فترات الاستراحة</strong></li>
                  <li>• <strong>يُمنع تمامًا التعدي أو عدم احترام أو مجادلة الخدام بالمكتبة</strong></li>
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-400 mb-2">English:</h4>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• The library must always remain <strong>as quiet as possible</strong> to respect readers and maintain focus</li>
                  <li>• Use of <strong>phones and laptops is allowed</strong>, provided users remain calm and respectful</li>
                  <li>• <strong>No food or drink</strong> is allowed inside the library <strong>except during official coffee breaks</strong></li>
                  <li>• It is <strong>strictly forbidden to assault, disrespect, or argue with library staff</strong></li>
                </ul>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-yellow-800 dark:text-yellow-400 font-medium mb-2" style={{ direction: 'rtl', textAlign: 'right' }}>
                  في حال حدوث مخالفة، يتلقى العضو <Badge variant="destructive" className="mx-1">تحذيرًا</Badge>. وإذا تكررت المخالفة، يتم <Badge variant="destructive" className="mx-1">تجميد العضوية</Badge>
                </p>
                <p className="text-yellow-800 dark:text-yellow-400 font-medium">
                  If any behavioral violations occur, the member will be <Badge variant="destructive" className="mx-1">warned</Badge>. Upon repeated offenses, <Badge variant="destructive" className="mx-1">membership will be frozen</Badge>
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Phone className="h-5 w-5" />
              🔔 إذا كان لديك أي مشكلة أو استفسار؟ - Problems or Questions?
            </h3>
            <div className="space-y-3">
              <p className="text-blue-100" style={{ direction: 'rtl', textAlign: 'right' }}>
                يرجى التوجه مباشرة إلى أمين المكتبة <strong>أو</strong> ملء <strong>نموذج الملاحظات</strong> المتاح على صفحة المكتبة
              </p>
              <p className="text-blue-100">
                Please contact the librarian directly <strong>or</strong> fill out the <strong>feedback form</strong> available on the library's website
              </p>
              <div className="mt-4">
                <a 
                  href="/feedback" 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  📝 Submit Feedback - إرسال الملاحظات
                </a>
              </div>
            </div>
          </div>

          {showCloseButton && onClose && (
            <div className="flex justify-center pt-4">
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                I Understand - Continue to Library - فهمت - متابعة إلى المكتبة
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LibraryPolicy;
