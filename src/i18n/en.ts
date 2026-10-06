/**
 * English dictionary. Its shape is the source of truth: `ar.ts` is typed as
 * `Dictionary`, so a missing or extra key in either language fails to compile.
 * `{name}` placeholders are filled with `format()` from ./dictionaries.
 */
export const en = {
  meta: {
    siteName: 'SOSO Ladies Salon',
    defaultDescription:
      'SOSO Ladies Salon — professional facial, permanent makeup, hair, nails and henna services at our salon or in the comfort of your home.',
    home: {
      title: 'SOSO Ladies Salon — Your Beauty, Our Passion',
      description:
        'Professional beauty services at our salon or in the comfort of your home. Contact SOSO Ladies Salon on WhatsApp or by phone.',
    },
    services: {
      title: 'Our Services',
      description:
        'Facial, permanent makeup, hair, nails and henna at SOSO Ladies Salon. Contact us on WhatsApp for details.',
    },
    offers: {
      title: 'Special Offers',
      description: 'Exclusive beauty offers from SOSO Ladies Salon.',
    },
    about: {
      title: 'About SOSO',
      description:
        'Beauty, care and confidence for every woman. Learn about SOSO Ladies Salon.',
    },
    contact: {
      title: 'Contact Us',
      description: 'Contact SOSO Ladies Salon on WhatsApp or call {phone}.',
    },
    notFound: {
      title: 'Page not found',
    },
    /** Service page title once siteConfig.city is set, e.g. "Facial in Doha". */
    serviceTitle: '{name} in {city}',
  },
  nav: {
    home: 'Home',
    services: 'Services',
    offers: 'Offers',
    about: 'About',
    contact: 'Contact',
    primaryLabel: 'Main navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    menuTitle: 'Menu',
    homeLinkLabel: 'SOSO Ladies Salon — home',
  },
  language: {
    switchTo: 'العربية',
    switchLabel: 'View this page in Arabic',
  },
  common: {
    skipToContent: 'Skip to content',
    whatsapp: 'WhatsApp',
    callNow: 'Call Now',
    askOnWhatsApp: 'Ask on WhatsApp',
    whatsappLabel: 'Chat with SOSO Ladies Salon on WhatsApp',
    callLabel: 'Call SOSO Ladies Salon',
    viewDetails: 'View Details',
    availableAtHome: 'Available at home',
    viewAllServices: 'View All Services',
    viewAllOffers: 'View All Offers',
    breadcrumbLabel: 'Breadcrumb',
    currency: 'QAR',
    opensInNewTab: '(opens in a new tab)',
    quickContactLabel: 'Quick contact',
  },
  /** Prefilled WhatsApp messages; {service} / {offer} are filled per page. */
  whatsappMessages: {
    service: 'Hello SOSO Ladies Salon, I would like to ask about the {service} service.',
    offer: 'Hello SOSO Ladies Salon, I would like to ask about the “{offer}” offer.',
    latestOffers: 'Hello SOSO Ladies Salon, I would like to ask about your latest offers.',
    salon: 'Hello SOSO Ladies Salon, I would like to ask about your salon services.',
    home: 'Hello SOSO Ladies Salon, I would like to ask about your home service.',
  },
  hero: {
    eyebrow: 'Beauty Care',
    titleLine1: 'Your Beauty,',
    titleLine2: 'Our Passion',
    subtitle: 'Professional beauty services at our salon or in the comfort of your home.',
    videoLabel:
      'SOSO Ladies Salon video: home beauty service, facial treatment, hair styling and henna design',
    pauseVideo: 'Pause video',
    playVideo: 'Play video',
  },
  trust: {
    label: 'Why SOSO',
    professional: 'Professional Service',
    quality: 'High Quality Products',
    home: 'Home Service Available',
    salon: 'Salon Service Available',
  },
  servicesSection: {
    title: 'Our Services',
    subtitle: 'Beauty services designed to make you look and feel your best.',
  },
  modes: {
    title: 'Beauty, Your Way',
    subtitle: 'Visit us at the salon, or let us bring the salon to you.',
    salonTitle: 'Salon Service',
    salonText: 'Visit SOSO Ladies Salon for your beauty treatment.',
    salonImageAlt: 'Hair styling at SOSO Ladies Salon',
    homeTitle: 'Home Service',
    homeText: 'Enjoy professional beauty services in the comfort of your home.',
    homeImageAlt: 'A SOSO beautician with a client at home',
    homeServicesLabel: 'Services available at home',
  },
  offersSection: {
    title: 'Special Offers',
    subtitle: 'Exclusive beauty offers for a more beautiful you.',
    getOffer: 'Get Offer on WhatsApp',
    priceNow: 'Now',
    priceWas: 'Was',
  },
  ctaBanner: {
    title: 'Ready for your beauty moment?',
    text: 'Message us on WhatsApp or call — we will be happy to help you choose the right service.',
  },
  servicesPage: {
    title: 'Our Services',
    subtitle: 'Discover our beauty services and contact us directly for details.',
  },
  serviceDetail: {
    highlightsTitle: 'What to expect',
    availabilityTitle: 'Where the service is available',
    availableSalon: 'At the salon',
    availableHome: 'At your home',
    itemsTitle: 'Our {name} Services',
    otherServices: 'Other Services',
    ctaTitle: 'Interested in {name}?',
    ctaText: 'Contact us on WhatsApp or call for details and availability.',
  },
  offersPage: {
    title: 'Special Offers',
    subtitle: 'Exclusive beauty offers for a more beautiful you.',
    emptyTitle: 'New offers coming soon',
    emptyText: 'Stay tuned for the latest SOSO offers.',
    emptyCta: 'Contact us on WhatsApp',
    emptyServices: 'Meanwhile, explore our services',
  },
  about: {
    title: 'About SOSO',
    lead: 'Beauty, Care and Confidence for Every Woman.',
    body: 'At SOSO Ladies Salon, we are dedicated to providing high-quality beauty services in a comfortable and friendly environment. Our professional team ensures you always look and feel your best.',
    imageAlt: 'Hair styling inside SOSO Ladies Salon',
    valuesTitle: 'Our values',
    commitmentTitle: 'Our Commitment',
    commitmentText:
      'We focus on providing a relaxing and premium beauty experience with attention to detail, quality and customer care.',
  },
  contact: {
    title: 'Contact Us',
    subtitle: 'We would love to hear from you. Get in touch for inquiries and appointments.',
    whatsapp: 'WhatsApp',
    call: 'Call Now',
    address: 'Our Location',
    hours: 'Working Hours',
    instagram: 'Follow Us on Instagram',
    email: 'Email',
    map: 'Map',
    openMap: 'Open in Maps',
  },
  footer: {
    tagline: 'Professional beauty services at our salon or in the comfort of your home.',
    /** Shown only once siteConfig.city is set. */
    location: '{city}, {country}',
    explore: 'Explore',
    services: 'Services',
    contact: 'Contact',
    rights: 'All rights reserved.',
  },
  notFound: {
    title: 'This page could not be found',
    text: 'The page you are looking for may have moved. You can go back to the home page or contact us directly.',
    backHome: 'Back to Home',
  },
};

export type Dictionary = typeof en;
