import React, { Suspense, lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Lazy loaded components
const Layout = lazy(() => import('./components/layout/Layout'))
const Home = lazy(() => import('./pages/Home'))
const Services = lazy(() => import('./pages/Services'))
const Projects = lazy(() => import('./pages/Projects'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Quote = lazy(() => import('./pages/Quote'))
const Blog = lazy(() => import('./pages/Blog'))
const BlogPost = lazy(() => import('./pages/BlogPost'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))

import { loader as serviceLoader } from './pages/Services'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'services',
        element: <Services />,
        loader: serviceLoader,
      },
      {
        path: 'projects',
        element: <Projects />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'contact',
        element: <Contact />,
      },
      {
        path: 'quote',
        element: <Quote />,
      },
      {
        path: 'blog',
        element: <Blog />,
      },
      {
        path: 'blog/:postId',
        element: <BlogPost />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminLogin />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App

// Dummy components for demonstration (these would be in their respective files)
// pages/Home.jsx
// import React from 'react';
// import { useLoaderData, Await } from 'react-router-dom';
// function Home() {
//   const { data } = useLoaderData();
//   return (
//     <div className="p-8 text-center bg-blue-100 rounded-lg shadow-md m-4">
//       <h1 className="text-3xl font-bold text-blue-800 mb-4">Home Page</h1>
//       <Suspense fallback={<p className="text-blue-600">Loading home content...</p>}>
//         <Await resolve={data}>
//           {(resolvedData) => (
//             <p className="text-lg text-blue-700">{resolvedData.message}</p>
//           )}
//         </Await>
//       </Suspense>
//       <p className="mt-4 text-blue-600">This is the home page content.</p>
//       <nav className="mt-8">
//         <ul className="flex justify-center space-x-4">
//           <li><a href="/services" className="text-blue-700 hover:underline">Services</a></li>
//           <li><a href="/projects" className="text-blue-700 hover:underline">Projects</a></li>
//           <li><a href="/admin" className="text-blue-700 hover:underline">Admin</a></li>
//         </ul>
//       </nav>
//     </div>
//   );
// }
// export default Home;

// pages/Services.jsx
// import React from 'react';
// import { useLoaderData } from 'react-router-dom';
// function Services() {
//   const { services } = useLoaderData();
//   return (
//     <div className="p-8 bg-green-100 rounded-lg shadow-md m-4">
//       <h1 className="text-3xl font-bold text-green-800 mb-4">Our Services</h1>
//       <ul className="list-disc list-inside text-green-700">
//         {services.map((service, index) => (
//           <li key={index}>{service}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }
// export default Services;

// pages/Projects.jsx
// import React from 'react';
// import { useLoaderData } from 'react-router-dom';
// function Projects() {
//   const { projects } = useLoaderData();
//   return (
//     <div className="p-8 bg-purple-100 rounded-lg shadow-md m-4">
//       <h1 className="text-3xl font-bold text-purple-800 mb-4">Our Projects</h1>
//       <ul className="list-disc list-inside text-purple-700">
//         {projects.map((project, index) => (
//           <li key={index}>{project}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }
// export default Projects;

// pages/About.jsx
// import React from 'react';
// import { useLoaderData } from 'react-router-dom';
// function About() {
//   const { content } = useLoaderData();
//   return (
//     <div className="p-8 bg-yellow-100 rounded-lg shadow-md m-4">
//       <h1 className="text-3xl font-bold text-yellow-800 mb-4">About Us</h1>
//       <p className="text-yellow-700">{content}</p>
//     </div>
//   );
// }
// export default About;

// pages/Contact.jsx
// import React from 'react';
// import { Form, useActionData } from 'react-router-dom';
// function Contact() {
//   const actionData = useActionData();
//   return (
//     <div className="p-8 bg-red-100 rounded-lg shadow-md m-4">
//       <h1 className="text-3xl font-bold text-red-800 mb-4">Contact Us</h1>
//       <Form method="post" className="space-y-4">
//         <div>
//           <label htmlFor="name" className="block text-red-700 text-sm font-bold mb-2">Name:</label>
//           <input type="text" id="name" name="name" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
//         </div>
//         <div>
//           <label htmlFor="email" className="block text-red-700 text-sm font-bold mb-2">Email:</label>
//           <input type="email" id="email" name="email" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
//         </div>
//         <div>
//           <label htmlFor="message" className="block text-red-700 text-sm font-bold mb-2">Message:</label>
//           <textarea id="message" name="message" rows="5" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required></textarea>
//         </div>
//         <button type="submit" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Send Message</button>
//       </Form>
//       {actionData && actionData.success && (
//         <p className="mt-4 text-green-600">{actionData.message}</p>
//       )}
//       {actionData && !actionData.success && (
//         <p className="mt-4 text-red-600">Error: {actionData.message}</p>
//       )}
//     </div>
//   );
// }
// export default Contact;

// pages/Quote.jsx
// import React from 'react';
// import { Form, useActionData } from 'react-router-dom';
// function Quote() {
//   const actionData = useActionData();
//   return (
//     <div className="p-8 bg-orange-100 rounded-lg shadow-md m-4">
//       <h1 className="text-3xl font-bold text-orange-800 mb-4">Get a Quote</h1>
//       <Form method="post" className="space-y-4">
//         <div>
//           <label htmlFor="service" className="block text-orange-700 text-sm font-bold mb-2">Service Needed:</label>
//           <input type="text" id="service" name="service" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
//         </div>
//         <div>
//           <label htmlFor="budget" className="block text-orange-700 text-sm font-bold mb-2">Budget:</label>
//           <input type="number" id="budget" name="budget" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
//         </div>
//         <button type="submit" className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Request Quote</button>
//       </Form>
//       {actionData && actionData.success && (
//         <p className="mt-4 text-green-600">{actionData.message}</p>
//       )}
//       {actionData && !actionData.success && (
//         <p className="mt-4 text-red-600">Error: {actionData.message}</p>
//       )}
//     </div>
//   );
// }
// export default Quote;

// pages/Blog.jsx
// import React from 'react';
// import { useLoaderData, Link } from 'react-router-dom';
// function Blog() {
//   const { posts } = useLoaderData();
//   return (
//     <div className="p-8 bg-cyan-100 rounded-lg shadow-md m-4">
//       <h1 className="text-3xl font-bold text-cyan-800 mb-4">Our Blog</h1>
//       <ul className="list-disc list-inside text-cyan-700">
//         {posts.map(post => (
//           <li key={post.id} className="mb-2">
//             <Link to={`/blog/${post.id}`} className="text-cyan-700 hover:underline">
//               {post.title} by {post.author}
//             </Link>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
// export default Blog;

// pages/BlogPost.jsx
// import React from 'react';
// import { useLoaderData, useRouteError } from 'react-router-dom';
// function BlogPost() {
//   const { post } = useLoaderData();
//   const error = useRouteError(); // For error handling, if loader throws
//   if (error) {
//     return (
//       <div className="p-8 bg-red-100 rounded-lg shadow-md m-4 text-center">
//         <h1 className="text-3xl font-bold text-red-800 mb-4">Error</h1>
//         <p className="text-red-700">{error.statusText || error.message}</p>
//       </div>
//     );
//   }
//   return (
//     <div className="p-8 bg-indigo-100 rounded-lg shadow-md m-4">
//       <h1 className="text-3xl font-bold text-indigo-800 mb-4">{post.title}</h1>
//       <p className="text-indigo-700 text-sm mb-4">By {post.author}</p>
//       <p className="text-indigo-700">{post.content}</p>
//     </div>
//   );
// }
// export default BlogPost;

// pages/NotFound.jsx
// import React from 'react';
// function NotFound() {
//   return (
//     <div className="p-8 text-center bg-gray-100 rounded-lg shadow-md m-4">
//       <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
//       <p className="text-lg text-gray-700">The page you are looking for does not exist.</p>
//       <a href="/" className="mt-4 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Go to Home</a>
//     </div>
//   );
// }
// export default NotFound;

// pages/admin/AdminLogin.jsx
// import React from 'react';
// import { Form, useActionData } from 'react-router-dom';
// function AdminLogin() {
//   const actionData = useActionData();
//   return (
//     <div className="p-8 bg-gray-200 rounded-lg shadow-md m-4">
//       <h1 className="text-3xl font-bold text-gray-800 mb-4">Admin Login</h1>
//       <Form method="post" className="space-y-4">
//         <div>
//           <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Username:</label>
//           <input type="text" id="username" name="username" defaultValue="admin" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
//         </div>
//         <div>
//           <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password:</label>
//           <input type="password" id="password" name="password" defaultValue="password" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required />
//         </div>
//         <button type="submit" className="bg-gray-700 hover:bg-gray-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Login</button>
//       </Form>
//       {actionData && actionData.success && (
//         <p className="mt-4 text-green-600">Login successful! <a href="/admin/dashboard" className="underline">Go to Dashboard</a></p>
//       )}
//       {actionData && !actionData.success && (
//         <p className="mt-4 text-red-600">{actionData.message}</p>
//       )}
//     </div>
//   );
// }
// export default AdminLogin;

// pages/admin/AdminDashboard.jsx
// import React from 'react';
// import { useLoaderData } from 'react-router-dom';
// function AdminDashboard() {
//   const { dashboardData } = useLoaderData();
//   return (
//     <div className="p-8 bg-blue-200 rounded-lg shadow-md m-4">
//       <h1 className="text-3xl font-bold text-blue-800 mb-4">Admin Dashboard</h1>
//       <p className="text-blue-700">Total Users: {dashboardData.users}</p>
//       <p className="text-blue-700">Pending Orders: {dashboardData.orders}</p>
//       <p className="text-blue-700">Total Revenue: ${dashboardData.revenue}</p>
//       <p className="mt-4 text-blue-600">Welcome to the admin dashboard!</p>
//     </div>
//   );
// }
// export default AdminDashboard;

// pages/admin/AdminLayout.jsx
// import React from 'react';
// import { Outlet } from 'react-router-dom';
// function AdminLayout() {
//   return (
//     <div className="min-h-screen bg-gray-800 text-white p-4">
//       <header className="bg-gray-900 p-4 rounded-lg shadow-md mb-4">
//         <h2 className="text-2xl font-bold text-center">Admin Panel</h2>
//         <nav className="mt-2 flex justify-center space-x-4">
//           <a href="/admin" className="text-gray-300 hover:text-white">Login</a>
//           <a href="/admin/dashboard" className="text-gray-300 hover:text-white">Dashboard</a>
//         </nav>
//       </header>
//       <main className="flex justify-center">
//         <Outlet /> {/* This is where child routes (Login, Dashboard) will render */}
//       </main>
//     </div>
//   );
// }
// export default AdminLayout;
