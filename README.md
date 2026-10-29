# نظام إدارة إعادة البيع (Resale Management System)

نظام متكامل لإدارة وحدات إعادة البيع لشركة تسويق عقاري، مبني بـ React + Node.js/Express + PostgreSQL.

---

## 📋 المراحل المكتملة ✅

### 1. البنية الأساسية للمشروع
- هيكل المشروع: `backend/` (Node.js/Express) و `frontend/` (React/Vite)
- إعداد بيئة التطوير مع ملفات `.env`
- تثبيت جميع الحزم والاعتماديات

### 2. قاعدة البيانات (PostgreSQL)
- مخطط قاعدة البيانات الكامل: `roles`, `users`, `developers`, `compounds`, `units`, `notifications`
- الأدوار الافتراضية: `admin`, `manager`, `agent`
- الفهارس (Indexes) لتحسين أداء الاستعلامات
- ملف الترحيل: `backend/src/database/migrate.js`

### 3. المصادقة والصلاحيات
- تسجيل الدخول وإنشاء الحسابات (JWT)
- نظام أدوار كامل: Admin (صلاحيات كاملة)، Manager (إدارة الوحدات والمطورين)، Agent (إضافة/تعديل الوحدات)
- حماية المسارات حسب الدور

### 4. إدارة المطورين والكمبوندات
- إضافة/تعديل/حذف المطورين العقاريين
- إضافة/تعديل/حذف الكمبوندات (مرتبطة بالمطورين)
- إدارة من قبل Admin و Manager فقط

### 5. إدارة الوحدات
- نموذج إدخال شامل لجميع تفاصيل الوحدة:
  - رقم الوحدة، المطور، الكمبوند
  - نوع الوحدة (شقة/فيلا/تاون هاوس/دوبلكس/بنتهاوس)
  - نوع العرض (إعادة بيع/بدون وسيط/مباشر من المالك)
  - المساحة (الأرضية والبناية)
  - الوصف، السعر، الحالة (متاحة/مباعة/محجوزة)
  - التشطيبات ورابط المواد
  - بيانات المالك (الاسم، الهاتف، البريد)
- بحث وتصفية متقدم حسب: المطور، الكمبوند، النوع، الحالة، السعر، المساحة
- عرض تفصيلي للوحدات مع إمكانية التعديل والحذف

### 6. تكامل واتساب ويب
- زر "تواصل عبر واتساب" في صفحة الوحدات
- رابط مباشر `https://wa.me/` مع رقم هاتف المالك
- فتح محادثة واتساب مباشرة

### 7. نظام الإشعارات
- جدول `notifications` في قاعدة البيانات
- إشعارات تلقائية عند تغيير حالة الوحدة
- جرس إشعارات في الواجهة مع عدّاد غير المقروء
- إمكانية تحديد الكل كمقروء

### 8. التقارير والإحصائيات
- لوحة تحكم تفاعلية مع رسوم بيانية (Chart.js):
  - الوحدات حسب المطور (رسم بياني أعمدة)
  - الوحدات حسب الحالة (رسم دائري)
  - الوحدات حسب الكمبوند (رسم بياني أعمدة)
  - أداء المطورين
- تقرير المبيعات
- اتجاهات الأسعار
- أداء المطورين

### 9. تصدير البيانات
- تصدير الوحدات إلى Excel (xlsx)
- تصدير الوحدات إلى PDF
- مع دعم الفلاتر الحالية

---

## 📝 المراحل المتبقية ⏳

### 1. تثبيت PostgreSQL وتشغيله
- **الخطوة الأولى والأهم**: تثبيت PostgreSQL 18.6 من الملف المحمّل:
  `C:\Users\khelw\Downloads\postgresql-18.6-3-windows-x64.exe`
- إنشاء قاعدة البيانات والمستخدم
- تشغيل ملف الترحيل: `node src/database/migrate.js`

### 2. إنشاء مستخدم Admin افتراضي
- إضافة مستخدم admin افتراضي (admin@example.com / password123)
- أو التسجيل من صفحة التسجيل

### 3. اختبار شامل
- اختبار جميع المسارات (API)
- اختبار الواجهة الأمامية
- اختبار التكامل بين الواجهة وقاعدة البيانات

### 4. تحسينات إضافية (اختياري)
- تحسين تجربة المستخدم
- إضافة المزيد من التقارير
- تحسين الأداء

---

## 🚀 كيفية التشغيل

### المتطلبات
- Node.js (v18 أو أحدث)
- PostgreSQL (v14 أو أحدث)

### الخطوات

#### 1. تثبيت PostgreSQL
1. شغّل الملف: `postgresql-18.6-3-windows-x64.exe`
2. اختر كلمة مرور للمستخدم `postgres` (مثال: `postgres`)
3. المنفذ الافتراضي: `5432`

#### 2. إنشاء قاعدة البيانات
```sql
CREATE DATABASE resale_management;
```

#### 3. إعداد الخادم (Backend)
```bash
cd backend
npm install
# تأكد من إعداد ملف .env
node src/database/migrate.js
npm start
```

#### 4. إعداد الواجهة (Frontend)
```bash
cd frontend
npm install
npm run dev
```

#### 5. الوصول للنظام
- الواجهة: `http://localhost:5173`
- الخادم: `http://localhost:3000`

---

## 🔐 بيانات الدخول الافتراضية
- البريد: `admin@example.com`
- كلمة المرور: `password123`

---

## 📁 هيكل المشروع

```
resale-management-system/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── developerController.js
│   │   │   ├── compoundController.js
│   │   │   ├── unitController.js
│   │   │   ├── notificationController.js
│   │   │   ├── reportController.js
│   │   │   └── exportController.js
│   │   ├── database/
│   │   │   ├── migrate.js
│   │   │   └── pool.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── developers.js
│   │   │   ├── compounds.js
│   │   │   ├── units.js
│   │   │   ├── notifications.js
│   │   │   ├── reports.js
│   │   │   └── export.js
│   │   └── index.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UnitForm.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── UnitsPage.jsx
│   │   │   ├── DevelopersPage.jsx
│   │   │   └── CompoundsPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

## 🔄 نقل النظام إلى جهاز آخر

1. انسخ مجلد `resale-management-system` كاملاً
2. على الجهاز الجديد:
   - ثبّت Node.js و PostgreSQL
   - شغّل `npm install` في مجلدي `backend` و `frontend`
   - أنشئ قاعدة البيانات وشغّل `node src/database/migrate.js`
   - شغّل `npm start` في backend و `npm run dev` في frontend

---

## 🛠️ التقنيات المستخدمة

- **الواجهة الأمامية**: React 18, Vite, Tailwind CSS, Chart.js, React Router, Axios, React Hook Form, Yup
- **الخادم**: Node.js, Express, JWT, bcrypt, PostgreSQL (pg), Helmet, CORS, Morgan
- **التصدير**: SheetJS (xlsx), pdf-lib
