import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { fetchDataFromApi } from '../../utils/api';
import CircularProgress from '@mui/material/CircularProgress';
import { Helmet } from 'react-helmet-async';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Fetch blog data
      fetchDataFromApi(`/api/blog/${id}`)
      .then((res) => {
        // Handle different response formats
        if (res?.error === false && res?.blog) {
          setBlog(res.blog);
        } else if (res?._id) {
          setBlog(res);
        } else if (res?.error === false && res?._id) {
          setBlog(res);
        } else {
          setError('Blog post not found');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching blog:', err);
        setError('Blog post not found');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-center">
          <CircularProgress />
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl mb-4 text-[#0b2735]">Blog post not found</h2>
          <button 
            onClick={() => navigate('/')}
            className="bg-[#0b2735] text-white px-6 py-2 rounded hover:bg-[#1a3d52] transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Extract plain text from HTML for meta description
  const getPlainText = (html) => {
    if (!html) return '';
    // Remove HTML tags using regex (client-side only)
    if (typeof document !== 'undefined') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.textContent || tempDiv.innerText || '';
    }
    // Fallback: simple regex strip
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
  };

  const plainDescription = getPlainText(blog.description);
  const metaDescription = plainDescription.substring(0, 160) || blog.title;
  const blogUrl = `https://zubahouse.com/blog/${blog._id}`;
  const blogImage = blog.images && blog.images.length > 0 ? blog.images[0] : 'https://zubahouse.com/logo.png';

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": metaDescription,
    "image": blogImage,
    "datePublished": blog.createdAt,
    "dateModified": blog.updatedAt || blog.createdAt,
    "author": {
      "@type": "Organization",
      "name": blog.author || "Zuba House"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Zuba House",
      "logo": {
        "@type": "ImageObject",
        "url": "https://zubahouse.com/logo.png"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{blog.title} | Zuba House Blog</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={`${blog.title}, Zuba House, blog, African fashion, home decor, art`} />
        <link rel="canonical" href={blogUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={blogUrl} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={blogImage} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={blogUrl} />
        <meta name="twitter:title" content={blog.title} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={blogImage} />
        
        {/* Article meta */}
        {blog.createdAt && (
          <meta property="article:published_time" content={new Date(blog.createdAt).toISOString()} />
        )}
        {blog.author && (
          <meta property="article:author" content={blog.author} />
        )}
      </Helmet>

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      <article className="blog-detail-page min-h-screen bg-white">
        {/* Header */}
        <header className="bg-[#0b2735] text-white py-6 sm:py-8">
          <div className="container mx-auto px-4 sm:px-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-4 sm:mb-6 hover:text-[#efb291] transition text-sm sm:text-base"
              aria-label="Go back"
            >
              <IoArrowBack className="text-lg sm:text-xl" /> Back
            </button>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3 sm:mb-4">
              {blog.title}
            </h1>
            {blog.createdAt && (
              <time 
                dateTime={blog.createdAt}
                className="text-gray-300 text-sm sm:text-base block"
              >
                {new Date(blog.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Featured Image */}
            {blog.images && blog.images.length > 0 && (
              <figure className="mb-6 sm:mb-8">
                <img 
                  src={blog.images[0]} 
                  alt={blog.title}
                  className="w-full h-[250px] sm:h-[350px] lg:h-[400px] object-cover rounded-lg shadow-md"
                  loading="eager"
                />
              </figure>
            )}

            {/* Blog Content */}
            <div 
              className="blog-content prose prose-sm sm:prose-base lg:prose-lg max-w-none
                prose-headings:text-[#0b2735] prose-headings:font-bold
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-[#0b2735] prose-a:underline hover:prose-a:text-[#1a3d52]
                prose-strong:text-[#0b2735] prose-strong:font-semibold
                prose-img:rounded-lg prose-img:shadow-md prose-img:my-6
                prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
                prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
                prose-li:text-gray-700 prose-li:mb-2
                prose-blockquote:border-l-4 prose-blockquote:border-[#0b2735] prose-blockquote:pl-4 prose-blockquote:italic
                prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-6
                prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-5
                prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4"
              dangerouslySetInnerHTML={{ __html: blog.description }}
            />

            {/* Author/Meta Info */}
            {blog.author && (
              <footer className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                <p className="text-gray-600 text-sm sm:text-base">
                  <strong className="text-[#0b2735]">Author:</strong> <span className="ml-2">{blog.author}</span>
                </p>
              </footer>
            )}

            {/* Back Button */}
            <div className="mt-8 sm:mt-12">
              <button 
                onClick={() => navigate('/')}
                className="bg-[#0b2735] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-md hover:bg-[#1a3d52] transition text-sm sm:text-base font-medium"
                aria-label="Return to home page"
              >
                Back to Home
              </button>
            </div>
          </div>
        </main>
      </article>
    </>
  );
};

export default BlogDetail;

