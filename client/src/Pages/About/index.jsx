import React from "react";
import { Link } from "react-router-dom";
import { FaGlobe, FaUsers, FaHeart, FaLeaf, FaHandshake, FaAward } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { motion } from "framer-motion";

const AboutUs = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  const stats = [
    { number: "190+", label: "Served Countries World Wide", icon: FaGlobe },
    { number: "20k+", label: "First Time Customers", icon: FaUsers },
    { number: "97.8%", label: "Customer Satisfaction Rate", icon: FaHeart },
    { number: "90%", label: "Sustainable Committed Products", icon: FaLeaf }
  ];

  return (
    <div className="about-us bg-white">
      <section
        className="relative h-[60vh] md:h-[70vh] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(11, 39, 53, 0.7), rgba(11, 39, 53, 0.7)), url('/images/about/hero-banner.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="container text-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
          >
            Zuba House
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-xl md:text-2xl lg:text-3xl text-[#efb291] font-semibold mb-6"
          >
            Luxe • Elegance • Fusion
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <p className="text-base md:text-lg leading-relaxed text-[#e5e2db]">
              An African eCommerce platform connecting the world with the rich tapestry of African culture through
              authentic, handcrafted treasures.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              variants={fadeIn}
            >
              <img
                src="https://res.cloudinary.com/dimtdehjp/image/upload/v1763072499/mission_k7faw5.jpg"
                alt="African Artisan"
                className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
              />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              variants={fadeIn}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#0b2735] mb-6 border-l-4 border-[#efb291] pl-4">
                Who We Are
              </h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Zuba House is an <strong className="text-[#0b2735]">African eCommerce platform</strong> dedicated to
                  connecting consumers with the rich tapestry of African culture through an extensive range of
                  high-quality products.
                </p>
                <p>
                  We curate an array of items, including{" "}
                  <strong className="text-[#efb291]">fashion, home decor, accessories, and artisanal crafts</strong>,
                  all sourced directly from talented artisans across the continent.
                </p>
                <p>
                  Our mission is to <strong className="text-[#0b2735]">promote and celebrate African craftsmanship</strong>{" "}
                  by providing a marketplace that showcases unique, handmade products that reflect the vibrant cultures and
                  traditions of Africa.
                </p>
                <p>
                  We believe in <strong className="text-[#efb291]">ethical sourcing and sustainability</strong>, supporting
                  local artisans and communities while bringing authentic African heritage to a global audience.
                </p>
                <div className="bg-[#efb291] bg-opacity-10 border-l-4 border-[#efb291] p-4 rounded-r-lg mt-6">
                  <p className="text-[#0b2735] font-semibold italic">
                    At Zuba House, we are more than just a store; we are a celebration of African creativity and a bridge
                    connecting the world to the artistry of the continent.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-[#0b2735] to-[#0f3a4d] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#efb291] rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#efb291] rounded-full blur-3xl"></div>
        </div>

        <div className="container px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            variants={fadeIn}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Our Amazing Partners</h2>
            <p className="text-[#e5e2db] text-lg">Who Are With Us</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 text-center border border-[#efb291] border-opacity-30 hover:bg-opacity-20 transition-all duration-300"
                >
                  <Icon className="text-5xl text-[#efb291] mx-auto mb-4" />
                  <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.number}</h3>
                  <p className="text-[#e5e2db] text-sm md:text-base leading-snug">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              variants={fadeIn}
              className="order-2 lg:order-1"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-[#efb291] p-4 rounded-full">
                  <FaHandshake className="text-3xl text-white" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-[#0b2735] mb-4">Our Mission</h2>
                  <div className="h-1 w-20 bg-[#efb291] rounded"></div>
                </div>
              </div>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  At Zuba House, our mission is to <strong className="text-[#0b2735]">celebrate African culture</strong>{" "}
                  by connecting customers with unique, high-quality products from local artisans.
                </p>
                <p>
                  We <strong className="text-[#efb291]">empower these artisans</strong> with a global marketplace,
                  ensuring fair compensation and sustainable livelihoods.
                </p>
                <p>
                  We prioritize <strong className="text-[#0b2735]">sustainability</strong> by aiming for a significant
                  portion of our products to be eco-friendly, contributing positively to both the environment and local
                  communities.
                </p>
                <p>
                  Through our diverse offerings, we strive to enhance <strong className="text-[#efb291]">cultural awareness and appreciation</strong>,
                  bridging the gap between Africa and the world.
                </p>
                <div className="bg-[#0b2735] text-white p-6 rounded-xl mt-6">
                  <p className="font-semibold text-lg">
                    Join us in uplifting communities and sharing the beauty of African culture globally!
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              variants={fadeIn}
              className="order-1 lg:order-2"
            >
              <img
                src="https://res.cloudinary.com/dimtdehjp/image/upload/v1763072498/hero-banner_t1zkuj.jpg"
                alt="Our Mission"
                className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              variants={fadeIn}
            >
              <img
                src="https://res.cloudinary.com/dimtdehjp/image/upload/v1763072498/africa-to-world_hvfoyx.jpg"
                alt="Our Vision"
                className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
              />
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              variants={fadeIn}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-[#0b2735] p-4 rounded-full">
                  <FaAward className="text-3xl text-[#efb291]" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-[#0b2735] mb-4">Our Vision</h2>
                  <div className="h-1 w-20 bg-[#0b2735] rounded"></div>
                </div>
              </div>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  At Zuba House, our vision is to be a <strong className="text-[#0b2735]">leading global platform</strong>{" "}
                  that showcases the richness of African culture through authentic products.
                </p>
                <p>
                  We aim to <strong className="text-[#efb291]">empower artisans</strong> by preserving traditional
                  craftsmanship while reaching a diverse audience.
                </p>
                <p>
                  By prioritizing <strong className="text-[#0b2735]">sustainability and ethical sourcing</strong>, we
                  envision a future where commerce benefits communities and the environment.
                </p>
                <p>
                  Ultimately, we seek to inspire a <strong className="text-[#efb291]">global community</strong> that values
                  cultural diversity and celebrates the artistry behind each unique piece.
                </p>
                <div className="bg-gradient-to-r from-[#0b2735] to-[#efb291] text-white p-6 rounded-xl mt-6">
                  <p className="font-semibold text-lg">Join us in connecting the world to the beauty of Africa!</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gradient-to-br from-[#efb291] to-[#e5a67d] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            variants={fadeIn}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-block bg-white bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Africa to the World</h2>
            </div>

            <div className="space-y-6 text-lg leading-relaxed text-white">
              <p>
                At Zuba House, we embrace the mission of showcasing <strong>Africa&apos;s vibrant heritage</strong> to a
                global audience.
              </p>
              <p>
                Our <strong>&quot;Africa to the World&quot;</strong> initiative connects talented artisans with customers
                around the globe, celebrating their unique creations and the rich stories behind them.
              </p>
              <p>
                We aim to promote <strong>cultural understanding</strong> and inspire appreciation for African artistry. By
                bridging cultures, we hope to enrich lives and foster connections across borders.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-12 bg-white rounded-2xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-[#0b2735] mb-4">Are You a Local Artisan?</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                If you are a local artisan and would like to collaborate with us, please reach out. Join us as we bring Africa
                to the world, one unique product at a time!
              </p>
              <a
                href="mailto:info@zubahouse.com"
                className="inline-flex items-center gap-3 bg-[#0b2735] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#efb291] hover:text-[#0b2735] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <IoMdMail className="text-2xl" />
                info@zubahouse.com
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-[#0b2735] text-white">
        <div className="container px-4 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            variants={fadeIn}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Explore African Craftsmanship?</h2>
            <p className="text-lg text-[#e5e2db] mb-8 max-w-2xl mx-auto">
              Discover unique, handcrafted products that tell the story of Africa&apos;s rich cultural heritage.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/products"
                className="bg-[#efb291] text-[#0b2735] px-8 py-4 rounded-full font-semibold text-lg hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Shop Now
              </Link>
              <a
                href="mailto:info@zubahouse.com"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-[#0b2735] transition-all duration-300"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
