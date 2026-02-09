import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaDollarSign,
  FaClipboardCheck,
  FaSearch,
  FaChartLine,
  FaLaptopCode,
  FaBullhorn,
  FaEnvelope,
  FaRocket,
  FaUsers,
  FaLightbulb,
  FaGlobeAfrica,
  FaGraduationCap,
  FaHeart
} from "react-icons/fa";

const Career = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const whyZubaHouse = [
    {
      icon: <FaGlobeAfrica className="text-[40px] text-[#efb291]" />,
      title: "Global Impact",
      description: "Connect African artisans with customers worldwide and shape the future of cross-border e-commerce."
    },
    {
      icon: <FaRocket className="text-[40px] text-[#efb291]" />,
      title: "Innovation First",
      description: "Work with cutting-edge technologies and innovative solutions in a fast-paced e-commerce environment."
    },
    {
      icon: <FaUsers className="text-[40px] text-[#efb291]" />,
      title: "Collaborative Culture",
      description: "Join a diverse, supportive team that values creativity, collaboration, and continuous learning."
    },
    {
      icon: <FaLightbulb className="text-[40px] text-[#efb291]" />,
      title: "Professional Growth",
      description: "Gain hands-on experience, mentorship, and opportunities to develop your skills in real-world projects."
    },
    {
      icon: <FaGraduationCap className="text-[40px] text-[#efb291]" />,
      title: "Learn & Build",
      description: "Master modern tools, frameworks, and industry best practices while building products that matter."
    },
    {
      icon: <FaHeart className="text-[40px] text-[#efb291]" />,
      title: "Purpose-Driven",
      description: "Be part of a mission to empower African entrepreneurs and celebrate African culture globally."
    }
  ];

  const internshipRoles = [
    {
      id: 1,
      title: "Software Development Intern",
      icon: <FaLaptopCode className="text-[40px] text-[#efb291]" />,
      responsibilities: [
        "Develop and maintain web applications using modern frameworks",
        "Write clean, efficient, and well-documented code",
        "Collaborate with cross-functional teams on feature development",
        "Participate in code reviews and sprint planning",
        "Debug and troubleshoot technical issues",
        "Contribute to improving development workflows and processes"
      ],
      idealCandidate: [
        "Strong foundation in programming (JavaScript, Python, or similar)",
        "Familiarity with web technologies (HTML, CSS, JavaScript, React)",
        "Understanding of databases and API development",
        "Problem-solving mindset and attention to detail",
        "Ability to work independently and in teams",
        "Portfolio or GitHub projects demonstrating coding skills"
      ]
    },
    {
      id: 2,
      title: "Digital Marketing Intern",
      icon: <FaSearch className="text-[40px] text-[#efb291]" />,
      responsibilities: [
        "Develop and execute digital marketing campaigns across channels",
        "Conduct SEO research and implement optimization strategies",
        "Create engaging content for social media and email marketing",
        "Analyze campaign performance and provide actionable insights",
        "Manage social media presence and community engagement",
        "Support product launches and promotional initiatives"
      ],
      idealCandidate: [
        "Passion for digital marketing and e-commerce",
        "Knowledge of SEO, social media, and content marketing",
        "Familiarity with analytics tools (Google Analytics, etc.)",
        "Strong writing and communication skills",
        "Creative thinking with data-driven approach",
        "Experience with marketing tools or campaigns (portfolio welcome)"
      ]
    }
  ];

  const programDetails = [
    { icon: <FaCalendarAlt />, title: "Duration", value: "3 Months" },
    { icon: <FaClock />, title: "Commitment", value: "Full-time" },
    { icon: <FaMapMarkerAlt />, title: "Location", value: "Remote (Rwanda-based)" },
    { icon: <FaDollarSign />, title: "Compensation", value: "Paid Internship" },
    { icon: <FaClipboardCheck />, title: "Start Date", value: "Summer 2026" }
  ];

  return (
    <div className="career-page bg-white">
      {/* Hero Section */}
      <motion.section
        className="bg-gradient-to-br from-[#0b2735] via-[#0f3547] to-[#0b2735] py-16 lg:py-24 relative overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-[#efb291] rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#efb291] rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={fadeInUp}
          >
            {/* Not Hiring Badge */}
            <motion.div
              className="inline-block mb-6 bg-[rgba(239,178,145,0.15)] border border-[rgba(239,178,145,0.3)] rounded-full px-6 py-2"
              variants={fadeInUp}
            >
              <p className="text-[#efb291] text-sm font-medium">
                ⚠️ Not Currently Hiring | Professional Internship Program Coming Soon
              </p>
            </motion.div>

            <motion.h1
              className="text-4xl lg:text-6xl font-bold text-[#e5e2db] mb-6 leading-tight"
              variants={fadeInUp}
            >
              Build the Future of <span className="text-[#efb291]">African E-commerce</span>
            </motion.h1>

            <motion.p
              className="text-lg lg:text-xl text-[#e5e2db] mb-4 opacity-90"
              variants={fadeInUp}
            >
              Where Innovation Meets Impact
            </motion.p>

            <motion.p
              className="text-base lg:text-lg text-[#e5e2db] mb-8 opacity-75 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              At Zuba House, we're creating a world-class e-commerce platform that connects 
              African artisans with global markets. Learn what makes us a great place to grow 
              your career and discover our upcoming professional internship opportunities.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeInUp}
            >
              <a
                href="#why-zuba"
                className="bg-[#efb291] text-[#0b2735] px-8 py-4 rounded-lg font-semibold hover:bg-[#e5a67d] transition-all shadow-lg hover:shadow-xl inline-block"
              >
                Why Zuba House?
              </a>
              <a
                href="#internship"
                className="border-2 border-[#efb291] text-[#efb291] px-8 py-4 rounded-lg font-semibold hover:bg-[rgba(239,178,145,0.1)] transition-all inline-block"
              >
                Internship Program
              </a>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Why Work at Zuba House Section */}
      <motion.section
        id="why-zuba"
        className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            variants={fadeInUp}
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0b2735] mb-4">
              Why Work at <span className="text-[#efb291]">Zuba House?</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Join a team that's passionate about innovation, cultural impact, and building 
              products that connect Africa to the world. Here's what makes Zuba House special:
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {whyZubaHouse.map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 hover:border-[#efb291] group"
                variants={fadeInUp}
              >
                <div className="flex justify-center mb-6 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-[#0b2735] mb-4 text-center">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Culture Highlights */}
          <motion.div
            className="mt-16 bg-gradient-to-br from-[#0b2735] to-[#0f3547] rounded-3xl p-8 lg:p-12 max-w-5xl mx-auto"
            variants={fadeInUp}
          >
            <h3 className="text-2xl lg:text-3xl font-bold text-[#e5e2db] mb-6 text-center">
              Our Culture & Values
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[#e5e2db]">
              <div className="flex items-start gap-4">
                <span className="text-[#efb291] text-2xl">-</span>
                <div>
                  <h4 className="font-bold mb-2">Excellence & Innovation</h4>
                  <p className="text-sm opacity-90">We strive for excellence in everything we do and constantly innovate to stay ahead.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-[#efb291] text-2xl">-</span>
                <div>
                  <h4 className="font-bold mb-2">Collaboration & Respect</h4>
                  <p className="text-sm opacity-90">We believe in teamwork, mutual respect, and creating an inclusive environment.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-[#efb291] text-2xl">-</span>
                <div>
                  <h4 className="font-bold mb-2">Growth & Learning</h4>
                  <p className="text-sm opacity-90">Continuous learning and professional development are at the core of our culture.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-[#efb291] text-2xl">-</span>
                <div>
                  <h4 className="font-bold mb-2">Impact & Purpose</h4>
                  <p className="text-sm opacity-90">Every role contributes to empowering African entrepreneurs and celebrating culture.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Professional Internship Program Section */}
      <motion.section
        id="internship"
        className="py-16 lg:py-24 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            variants={fadeInUp}
          >
            <div className="inline-block mb-4 bg-[#efb291] text-[#0b2735] px-6 py-2 rounded-full font-semibold">
              Coming Summer 2026
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-[#0b2735] mb-4">
              Professional <span className="text-[#efb291]">Internship Program</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              A comprehensive 3-month paid internship program designed to launch your career 
              in software development and digital marketing.
            </p>
          </motion.div>

          {/* Program Overview */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto mb-16"
            variants={staggerContainer}
          >
            {programDetails.map((detail, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-all hover:border-[#efb291] group"
                variants={fadeInUp}
              >
                <div className="text-[#0b2735] text-3xl mb-3 group-hover:text-[#efb291] transition-colors flex justify-center">
                  {detail.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">{detail.title}</h3>
                <p className="text-[#0b2735] font-bold">{detail.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Program Highlights */}
          <motion.div
            className="bg-[#0b2735] rounded-3xl p-8 lg:p-12 mb-16 max-w-5xl mx-auto"
            variants={fadeInUp}
          >
            <h3 className="text-2xl lg:text-3xl font-bold text-[#e5e2db] mb-8 text-center">
              What You'll Get
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 text-[#e5e2db]">
                <span className="text-[#efb291] text-2xl">-</span>
                <div>
                  <h4 className="font-bold mb-2">Competitive Compensation</h4>
                  <p className="text-sm opacity-90">Paid internship with market-competitive stipend</p>
                </div>
              </div>
              <div className="flex items-start gap-4 text-[#e5e2db]">
                <span className="text-[#efb291] text-2xl">-</span>
                <div>
                  <h4 className="font-bold mb-2">Expert Mentorship</h4>
                  <p className="text-sm opacity-90">One-on-one guidance from experienced professionals</p>
                </div>
              </div>
              <div className="flex items-start gap-4 text-[#e5e2db]">
                <span className="text-[#efb291] text-2xl">-</span>
                <div>
                  <h4 className="font-bold mb-2">Real Projects</h4>
                  <p className="text-sm opacity-90">Work on live features and products impacting real users</p>
                </div>
              </div>
              <div className="flex items-start gap-4 text-[#e5e2db]">
                <span className="text-[#efb291] text-2xl">-</span>
                <div>
                  <h4 className="font-bold mb-2">Career Development</h4>
                  <p className="text-sm opacity-90">Certificate, portfolio projects, and potential full-time offer</p>
                </div>
              </div>
              <div className="flex items-start gap-4 text-[#e5e2db]">
                <span className="text-[#efb291] text-2xl">-</span>
                <div>
                  <h4 className="font-bold mb-2">Modern Tech Stack</h4>
                  <p className="text-sm opacity-90">Hands-on experience with industry-leading tools</p>
                </div>
              </div>
              <div className="flex items-start gap-4 text-[#e5e2db]">
                <span className="text-[#efb291] text-2xl">-</span>
                <div>
                  <h4 className="font-bold mb-2">Remote Flexibility</h4>
                  <p className="text-sm opacity-90">Work from anywhere in Rwanda with flexible hours</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Available Positions */}
          <motion.div variants={fadeInUp}>
            <h3 className="text-2xl lg:text-3xl font-bold text-center text-[#0b2735] mb-12">
              Available <span className="text-[#efb291]">Positions</span>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
              {internshipRoles.map((role) => (
                <motion.div
                  key={role.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-[#efb291]"
                  variants={fadeInUp}
                >
                  <div className="bg-gradient-to-br from-[#0b2735] to-[#0f3547] p-8 text-center">
                    <div className="flex justify-center mb-4">{role.icon}</div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-[#e5e2db] mb-2">
                      {role.title}
                    </h3>
                    <div className="flex items-center justify-center gap-2 text-[#efb291] text-sm">
                      <FaClock />
                      <span>3 Months | Full-time | Paid</span>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="mb-8">
                      <h4 className="text-lg font-bold text-[#0b2735] mb-4 flex items-center gap-2">
                        <FaChartLine className="text-[#efb291]" />
                        Key Responsibilities
                      </h4>
                      <ul className="space-y-3">
                        {role.responsibilities.map((resp, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-700">
                            <span className="text-[#efb291] mt-1">▸</span>
                            <span className="text-sm leading-relaxed">{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-lg font-bold text-[#0b2735] mb-4 flex items-center gap-2">
                        <FaBullhorn className="text-[#efb291]" />
                        Ideal Candidate
                      </h4>
                      <ul className="space-y-3">
                        {role.idealCandidate.map((quality, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-gray-700">
                            <span className="text-[#efb291] mt-1">✓</span>
                            <span className="text-sm leading-relaxed">{quality}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-[#efb291] bg-opacity-10 border border-[#efb291] rounded-lg p-4 text-center">
                      <p className="text-[#0b2735] font-semibold">
                        Applications open <span className="text-[#efb291]">May 2026</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Important Notice */}
      <motion.section
        className="py-12 lg:py-16 bg-gradient-to-br from-[#0b2735] to-[#0f3547]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-[rgba(239,178,145,0.1)] border-2 border-[#efb291] rounded-2xl p-8 lg:p-12"
              variants={fadeInUp}
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-[#efb291] text-[#0b2735] rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0 text-2xl font-bold">
                  ℹ️
                </div>
                <div>
                  <h2 className="text-2xl lg:text-3xl font-bold text-[#efb291] mb-2">
                    Important Information
                  </h2>
                  <p className="text-[#e5e2db] text-sm opacity-90">
                    Please read carefully
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-[#e5e2db]">
                <p className="text-base lg:text-lg leading-relaxed">
                  <strong className="text-[#efb291]">Current Status:</strong> We are <strong>not currently hiring</strong> for permanent positions or accepting applications at this time.
                </p>

                <p className="text-base lg:text-lg leading-relaxed">
                  <strong className="text-[#efb291]">Internship Timeline:</strong> Our professional internship program will launch in <strong>Summer 2026</strong>. Applications will open in <strong>May 2026</strong>.
                </p>

                <p className="text-base lg:text-lg leading-relaxed">
                  <strong className="text-[#efb291]">Eligibility:</strong> The program is open to candidates based in <strong>Rwanda</strong> with relevant skills and experience in software development or digital marketing.
                </p>

                <div className="bg-[rgba(239,178,145,0.15)] border border-[#efb291] rounded-xl p-6 mt-6">
                  <p className="text-base lg:text-lg leading-relaxed font-medium">
                    <strong className="text-[#efb291]">Stay Updated:</strong> Want to be notified when applications open? Email us at <a href="mailto:info@zubahouse.com" className="underline hover:text-[#efb291]">info@zubahouse.com</a> with the subject "Internship Interest 2026" to join our waitlist.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-16 lg:py-20 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              className="text-3xl lg:text-5xl font-bold text-[#0b2735] mb-6"
              variants={fadeInUp}
            >
              Join Our <span className="text-[#efb291]">Talent Community</span>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto"
              variants={fadeInUp}
            >
              Stay connected and be the first to know when our internship applications open. 
              We're building something special, and we'd love for you to be part of it.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeInUp}
            >
              <a
                href="mailto:info@zubahouse.com?subject=Internship%20Interest%202026&body=Hi%20Zuba%20House%20Team,%0A%0AI%20am%20interested%20in%20joining%20the%20waitlist%20for%20the%20Summer%202026%20internship%20program.%0A%0AName:%0ARole%20of%20Interest:%20[Software%20Development%20/%20Digital%20Marketing]%0ALinkedIn/Portfolio:%0A%0AThank%20you!"
                className="bg-[#efb291] text-[#0b2735] px-10 py-5 rounded-lg font-bold text-lg hover:bg-[#e5a67d] transition-all shadow-xl hover:shadow-2xl inline-flex items-center justify-center gap-3 group"
              >
                <FaEnvelope className="group-hover:scale-110 transition-transform" />
                Join the Waitlist
              </a>
              <Link
                to="/about-us"
                className="border-2 border-[#efb291] text-[#efb291] px-10 py-5 rounded-lg font-bold text-lg hover:bg-[rgba(239,178,145,0.1)] transition-all inline-flex items-center justify-center gap-3"
              >
                Learn More About Us
              </Link>
            </motion.div>

            <motion.div
              className="mt-12 pt-8 border-t border-gray-200"
              variants={fadeInUp}
            >
              <p className="text-gray-600 text-sm">
                Questions? Email us at <a href="mailto:info@zubahouse.com" className="text-[#efb291] underline hover:text-[#e5a67d]">info@zubahouse.com</a>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Career;
