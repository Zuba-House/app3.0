import React from "react";
import { IoMdTime } from "react-icons/io";
import { Link } from "react-router-dom";
import { IoIosArrowForward } from "react-icons/io";
import { fetchDataFromApi, deleteData } from '../../utils/api';
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";


const BlogItem = (props) => {
  // Extract plain text for better mobile display
  const getPlainText = (html) => {
    if (!html) return '';
    // Remove HTML tags using regex
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
  };

  const plainText = getPlainText(props?.item?.description);
  const excerpt = plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;

  return (
    <article className="blogItem group h-full flex flex-col bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <div className="imgWrapper w-full overflow-hidden rounded-t-md cursor-pointer relative aspect-[16/10] sm:aspect-[16/9]">
        <LazyLoadImage
          alt={props?.item?.title || "Blog post image"}
          effect="blur"
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
          src={props?.item?.images?.[0]}
          loading="lazy"
        />

        <span className="flex items-center justify-center text-white absolute bottom-2 sm:bottom-3 right-2 sm:right-3 z-50 bg-primary rounded-md px-2 py-1 text-[10px] sm:text-[11px] font-[500] gap-1 shadow-md">
          <IoMdTime className="text-[14px] sm:text-[16px]" /> 
          <span className="whitespace-nowrap">{props?.item?.createdAt?.split("T")[0]}</span>
        </span>
      </div>

      <div className="info p-3 sm:p-4 flex-1 flex flex-col">
        <h2 className="text-[14px] sm:text-[15px] lg:text-[16px] font-[600] text-black mb-2 sm:mb-3 line-clamp-2 min-h-[2.5em]">
          <Link 
            to={`/blog/${props?.item?._id}`} 
            className="link hover:text-primary transition-colors"
            aria-label={`Read article: ${props?.item?.title}`}
          >
            {props?.item?.title}
          </Link>
        </h2>

        <div 
          className="mb-3 sm:mb-4 text-[12px] sm:text-[13px] lg:text-[14px] text-gray-600 leading-relaxed line-clamp-3 flex-1"
          dangerouslySetInnerHTML={{ __html: excerpt }}
        />

        <Link 
          to={`/blog/${props?.item?._id}`} 
          className="link font-[500] text-[12px] sm:text-[13px] lg:text-[14px] flex items-center gap-1 text-primary hover:text-[#1a3d52] transition-colors mt-auto"
          aria-label={`Read more about ${props?.item?.title}`}
        >
          Read More <IoIosArrowForward className="text-sm" />
        </Link>
      </div>
    </article>
  );
};

export default BlogItem;
