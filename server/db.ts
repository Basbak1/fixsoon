import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { hashPassword } from './auth.js';
import type {
  AuditLog,
  Dispute,
  GtaLocation,
  Job,
  Message,
  NotificationItem,
  ProviderProfile,
  Quote,
  RequestMatch,
  Review,
  ServiceCategory,
  ServiceRequest,
  ServiceSubcategory,
  UserRole,
} from '../src/types/fixsoon.js';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password_hash: string;
  city: string;
  company_id?: string | null;
  firebase_uid?: string;
  is_demo?: boolean;
  is_active?: boolean;
  saved_provider_ids: string[];
  created_at: string;
}

export interface DatabaseState {
  schema_version?: number;
  users: UserRecord[];
  service_categories: ServiceCategory[];
  service_subcategories: ServiceSubcategory[];
  gta_locations: GtaLocation[];
  provider_profiles: ProviderProfile[];
  service_requests: ServiceRequest[];
  request_matches: RequestMatch[];
  quotes: Quote[];
  jobs: Job[];
  messages: Message[];
  reviews: Review[];
  disputes: Dispute[];
  notifications: NotificationItem[];
  audit_logs: AuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DEFAULT_DB_FILE = process.env.WORLDLEO_DB_FILE
  ? path.resolve(process.env.WORLDLEO_DB_FILE)
  : path.join(DATA_DIR, 'fixsoon.json');

export const CURRENT_SCHEMA_VERSION = 2;

export function createSeedState(): DatabaseState {
  const demoPass = hashPassword('FixSoon2026!');
  const now = new Date().toISOString();

  const categories: ServiceCategory[] = [
    {
      id: 'cat_auto',
      slug: 'automotive-roadside',
      division: 'auto',
      name: 'Auto Services & FixSoon Roadside',
      description:
        'Mobile mechanics, flat tire repair & replacement, battery boosts, diagnostics, and FixSoon rapid roadside assistance across Ontario.',
      image_url: '/src/assets/images/category_automotive_1794446299137.jpg',
      is_active: true,
      seo_title: 'WorldLeo Auto & FixSoon Roadside — Mobile Mechanics & Flat Tire Service | Ontario',
      seo_description:
        'Connect with independent mobile mechanics, tire specialists, and FixSoon roadside responders for cars, trucks, Bobcats, and trailers across Ontario.',
      dynamic_fields: [
        {
          key: 'equipment_type',
          label: 'Vehicle or equipment type',
          type: 'select',
          required: true,
          options: [
            'Car / SUV / Minivan',
            'Pickup / Commercial Truck',
            'Bobcat / Skid Steer / Compact Equipment',
            'Trailer / Utility Trailer',
            'Other Vehicle or Equipment',
          ],
        },
        { key: 'vehicle_year', label: 'Year', type: 'text', required: true, placeholder: 'e.g. 2019' },
        { key: 'vehicle_make', label: 'Make / Brand', type: 'text', required: true, placeholder: 'e.g. Honda, Ford, Bobcat, Load Trail' },
        { key: 'vehicle_model', label: 'Model', type: 'text', required: true, placeholder: 'e.g. Civic, F-250, S650, 14ft Dump' },
        {
          key: 'can_vehicle_move',
          label: 'Can it be driven or moved safely?',
          type: 'select',
          required: true,
          options: ['No, it will not start or move', 'Yes, but warning light or noise present', 'Not sure'],
        },
      ],
    },
    {
      id: 'cat_home',
      slug: 'home-services',
      division: 'home',
      name: 'Home Services & Renovations',
      description:
        'Home repairs and maintenance, kitchen and bathroom renovations, plumbing, electrical, painting, flooring, landscaping, and AI Design Studio project quotes.',
      image_url: '/src/assets/images/category_home_appliance_1794446298673.jpg',
      is_active: true,
      seo_title: 'WorldLeo Home — Repairs, Renovations, Trades & AI Design Studio | Ontario',
      seo_description:
        'Compare transparent quotes from independent home repair specialists, plumbers, electricians, and renovation contractors across Ontario.',
      dynamic_fields: [
        {
          key: 'property_type',
          label: 'Property type',
          type: 'select',
          required: true,
          options: ['Detached / Semi-detached house', 'Townhouse', 'Condo / Apartment', 'Commercial space'],
        },
        {
          key: 'project_area',
          label: 'Room or home area',
          type: 'text',
          required: true,
          placeholder: 'e.g. Kitchen, Main Bathroom, Basement, Backyard',
        },
        {
          key: 'project_scope',
          label: 'Scope of work',
          type: 'select',
          required: true,
          options: ['Small repair or installation', 'Targeted upgrade', 'Full renovation / remodel', 'Planning from AI Design Studio'],
        },
        {
          key: 'timeline_window',
          label: 'Target timeline',
          type: 'select',
          required: false,
          options: ['As soon as possible', 'Within 1–2 weeks', 'Within 1–3 months', 'Planning / budgeting stage'],
        },
      ],
    },
  ];

  const subcategories: ServiceSubcategory[] = [
    {
      id: 'sub_mobile_mech',
      category_id: 'cat_auto',
      slug: 'mobile-mechanic',
      name: 'Mobile Mechanic (Cars, Trucks, Bobcat & Trailers)',
      description:
        'On-site diagnostics, starter/alternator repairs, brakes, hydraulic & diesel troubleshooting, and inspections for cars, trucks, Bobcats, and trailers.',
      keywords: [
        'mechanic',
        'repair',
        'engine',
        'noise',
        'brake',
        'alternator',
        'starter',
        'inspection',
        'truck',
        'bobcat',
        'skid steer',
        'trailer',
        'diesel',
        'hydraulic',
        'equipment',
      ],
      typical_duration: '1–2 hours',
      seo_title: 'Mobile Mechanic for Cars, Trucks, Bobcat & Trailers | WorldLeo Auto',
      seo_description:
        'Compare quotes from independent mobile mechanics for cars, trucks, Bobcats, and trailers across the GTA, Hamilton, and Niagara.',
    },
    {
      id: 'sub_flat_tire',
      category_id: 'cat_auto',
      slug: 'flat-tire-assistance',
      name: 'Flat Tire Service (Cars, Trucks, Bobcat & Trailers)',
      description:
        'Mobile flat tire repair, spare mounting, heavy-duty truck & trailer tire swaps, Bobcat/skid-steer tire service, and blowout assistance.',
      keywords: [
        'flat tire',
        'flat',
        'tire',
        'puncture',
        'nail',
        'blowout',
        'spare tire',
        'tire change',
        'rim',
        'truck',
        'trailer',
        'bobcat',
        'skid steer',
        'lug',
        'patch',
        'plug',
      ],
      typical_duration: '30–60 mins',
      seo_title: 'Flat Tire Service for Cars, Trucks, Bobcat & Trailers | WorldLeo Auto & FixSoon',
      seo_description:
        'Flat tire on a car, truck, Bobcat, or trailer in Ontario? Request an independent mobile tire technician via WorldLeo Auto & FixSoon.',
    },
    {
      id: 'sub_roadside',
      category_id: 'cat_auto',
      slug: 'roadside-assistance',
      name: 'FixSoon Rapid Roadside Assistance',
      description:
        'Urgent roadside help under WorldLeo Auto for stranded cars, work trucks, and trailers including boosts, lockouts, and emergency mobile assistance.',
      keywords: ['stranded', 'roadside', 'emergency', 'tow', 'stuck', 'help', 'highway', 'truck', 'trailer', 'fixsoon'],
      typical_duration: '30–60 mins',
      seo_title: 'FixSoon Rapid Roadside Assistance in Ontario | WorldLeo Auto',
      seo_description:
        'Request fast FixSoon roadside assistance from independent mobile professionals across Toronto, Mississauga, Brampton, Hamilton, and Niagara.',
    },
    {
      id: 'sub_battery_boost',
      category_id: 'cat_auto',
      slug: 'battery-boost',
      name: 'Battery Boost & Jumpstart',
      description:
        'Safe commercial-grade 12V/24V jumpstart and charging system check for cars, trucks, Bobcats, and equipment.',
      keywords: ['wont start', "won't start", 'dead battery', 'jump', 'boost', 'click', 'no crank', 'car dead', 'truck', 'bobcat'],
      typical_duration: '20–40 mins',
      seo_title: 'Battery Boost & Jumpstart Service in Ontario | WorldLeo Auto',
      seo_description:
        'Dead battery on a car, truck, or job-site equipment? Find independent technicians for a safe boost and charging test.',
    },
    {
      id: 'sub_battery_replace',
      category_id: 'cat_auto',
      slug: 'battery-replacement',
      name: 'Mobile Battery Replacement',
      description:
        'On-site battery testing, removal, and installation of a compatible replacement battery for cars, trucks, and equipment.',
      keywords: ['battery replacement', 'new battery', 'battery dead', 'corroded', 'replace battery', 'truck', 'bobcat'],
      typical_duration: '30–60 mins',
      seo_title: 'Mobile Battery Replacement in Toronto & GTA | WorldLeo Auto',
      seo_description: 'Get quotes for mobile battery replacement at home, job site, or roadside in Ontario.',
    },
    {
      id: 'sub_diagnostics',
      category_id: 'cat_auto',
      slug: 'vehicle-diagnostics',
      name: 'Vehicle & Equipment Diagnostics',
      description:
        'OBD-II & heavy-duty fault code scanning, electrical tracing, trailer wiring checks, and pre-purchase inspections.',
      keywords: ['check engine', 'light', 'diagnostic', 'scan', 'code', 'electrical', 'inspection', 'trailer wiring', 'bobcat', 'truck'],
      typical_duration: '45–90 mins',
      seo_title: 'Mobile Vehicle & Equipment Diagnostics | WorldLeo Auto',
      seo_description: 'Book an independent mobile technician for diagnostics and pre-purchase inspections across Ontario.',
    },
    {
      id: 'sub_home_repairs',
      category_id: 'cat_home',
      slug: 'home-repairs-maintenance',
      name: 'Home Repairs & General Maintenance',
      description:
        'Interior carpentry, door and trim repairs, drywall patching, hardware installation, and seasonal property upkeep.',
      keywords: ['repair', 'handyman', 'door', 'trim', 'drywall', 'maintenance', 'shelf', 'mount', 'carpentry'],
      typical_duration: '1–4 hours',
      seo_title: 'Home Repairs & Maintenance Professionals | WorldLeo Home',
      seo_description: 'Connect with trusted home repair and maintenance pros across the GTA, Hamilton, and Niagara.',
    },
    {
      id: 'sub_kitchen_reno',
      category_id: 'cat_home',
      slug: 'kitchen-renovation',
      name: 'Kitchen Renovation & Cabinetry',
      description:
        'Cabinet refacing or installation, backsplash tiling, countertop prep, island framing, and AI Design Studio kitchen quote scoping.',
      keywords: ['kitchen', 'renovation', 'cabinet', 'countertop', 'backsplash', 'remodel', 'island'],
      typical_duration: '1–4 weeks',
      seo_title: 'Kitchen Renovation Contractors | WorldLeo Home',
      seo_description: 'Compare transparent renovation quotes for kitchens across Ontario with WorldLeo Home.',
    },
    {
      id: 'sub_bathroom_reno',
      category_id: 'cat_home',
      slug: 'bathroom-renovation',
      name: 'Bathroom Renovation & Tiling',
      description:
        'Vanity upgrades, shower waterproofing and tilework, tub conversions, ventilation, and bathroom renovation planning.',
      keywords: ['bathroom', 'shower', 'vanity', 'tile', 'waterproofing', 'bath remodel'],
      typical_duration: '1–3 weeks',
      seo_title: 'Bathroom Renovation & Tiling Specialists | WorldLeo Home',
      seo_description: 'Request contractor quotes for bathroom upgrades and full remodels on WorldLeo Home.',
    },
    {
      id: 'sub_backyard',
      category_id: 'cat_home',
      slug: 'backyard-landscaping',
      name: 'Landscaping & Backyard Design',
      description:
        'Decks, patios, interlock walkways, fencing, pergolas, and outdoor living projects from concept to quote.',
      keywords: ['backyard', 'deck', 'patio', 'interlock', 'fence', 'pergola', 'landscaping'],
      typical_duration: '3 days – 3 weeks',
      seo_title: 'Backyard, Deck & Interlock Contractors | WorldLeo Home',
      seo_description: 'Turn backyard concepts into contractor quotes across the GTA, Hamilton, and Niagara.',
    },
    {
      id: 'sub_plumbing',
      category_id: 'cat_home',
      slug: 'plumbing-fixtures',
      name: 'Plumbing & Fixture Repair',
      description: 'Leaking faucets, toilet repairs, P-trap clearing, shut-off valves, and fixture installations.',
      keywords: ['faucet', 'leak', 'leaking', 'plumbing', 'toilet', 'sink', 'pipe', 'drain'],
      typical_duration: '1–2 hours',
      seo_title: 'Plumbing & Faucet Repair Services | WorldLeo Home',
      seo_description: 'Connect with local plumbing and fixture repair professionals in Ontario.',
    },
    {
      id: 'sub_electrical',
      category_id: 'cat_home',
      slug: 'electrical-handyman',
      name: 'Electrical & Lighting Installation',
      description: 'Outlet troubleshooting, smart switches, pot lights, ceiling fans, and interior/exterior fixture installations.',
      keywords: ['electrical', 'outlet', 'light', 'breaker', 'switch', 'fan', 'lighting'],
      typical_duration: '1–3 hours',
      seo_title: 'Electrical & Lighting Professionals | WorldLeo Home',
      seo_description: 'Find qualified electrical and lighting professionals across the GTA, Hamilton, and Niagara.',
    },
    {
      id: 'sub_painting_flooring',
      category_id: 'cat_home',
      slug: 'painting-and-flooring',
      name: 'Painting, Drywall & Flooring',
      description: 'Interior painting, drywall finishing, hardwood/vinyl plank flooring, and baseboard trim updates.',
      keywords: ['paint', 'painting', 'flooring', 'hardwood', 'vinyl', 'laminate', 'drywall'],
      typical_duration: '1–5 days',
      seo_title: 'Painting & Flooring Contractors | WorldLeo Home',
      seo_description: 'Compare written quotes from residential painters and flooring installers on WorldLeo Home.',
    },
    {
      id: 'sub_washer',
      category_id: 'cat_home',
      slug: 'washing-machine-repair',
      name: 'Washing Machine & Dryer Repair',
      description: 'Troubleshooting leaks, drain pump failures, spin issues, and heating problems for laundry appliances.',
      keywords: ['washing machine', 'washer', 'dryer', 'leaking', 'spin', 'drain', 'laundry'],
      typical_duration: '1–2 hours',
      seo_title: 'Washing Machine & Dryer Repair | WorldLeo Home',
      seo_description: 'Find independent appliance technicians for washing machine and dryer repairs across Ontario.',
    },
    {
      id: 'sub_fridge',
      category_id: 'cat_home',
      slug: 'refrigerator-repair',
      name: 'Refrigerator & Stove Repair',
      description: 'Cooling diagnostics, thermostat replacement, oven elements, and kitchen appliance servicing.',
      keywords: ['fridge', 'refrigerator', 'freezer', 'stove', 'oven', 'not cooling', 'appliance'],
      typical_duration: '1–2 hours',
      seo_title: 'Refrigerator & Kitchen Appliance Repair | WorldLeo Home',
      seo_description: 'Request quotes from independent refrigerator and stove repair specialists across Ontario.',
    },
  ];

  const gtaLocations: GtaLocation[] = [
    { slug: 'toronto', name: 'Toronto', region: 'City of Toronto', neighbourhoods: ['Downtown', 'North York', 'Scarborough', 'Etobicoke', 'East York'] },
    { slug: 'mississauga', name: 'Mississauga', region: 'Peel Region', neighbourhoods: ['Square One', 'Port Credit', 'Erin Mills', 'Meadowvale', 'Malton'] },
    { slug: 'brampton', name: 'Brampton', region: 'Peel Region', neighbourhoods: ['Bramalea', 'Downtown Brampton', 'Mount Pleasant', 'Heart Lake'] },
    { slug: 'markham', name: 'Markham', region: 'York Region', neighbourhoods: ['Unionville', 'Milliken', 'Cornell', 'Thornhill'] },
    { slug: 'vaughan', name: 'Vaughan', region: 'York Region', neighbourhoods: ['Woodbridge', 'Maple', 'Concord', 'Thornhill'] },
    { slug: 'oakville', name: 'Oakville', region: 'Halton Region', neighbourhoods: ['Bronte', 'Glen Abbey', 'Clearview', 'Downtown Oakville'] },
    { slug: 'burlington', name: 'Burlington', region: 'Greater Hamilton Area / Halton', neighbourhoods: ['Aldershot', 'Downtown Burlington', 'Brant Hills', 'Orchard'] },
    { slug: 'hamilton', name: 'Hamilton', region: 'Greater Hamilton Area', neighbourhoods: ['Downtown Hamilton', 'Stoney Creek', 'Ancaster', 'Dundas', 'Waterdown', 'Binbrook'] },
    { slug: 'grimsby', name: 'Grimsby', region: 'Niagara Region', neighbourhoods: ['Grimsby Beach', 'QEW Corridor', 'West Lincoln Border'] },
    { slug: 'st-catharines', name: 'St. Catharines', region: 'Niagara Region', neighbourhoods: ['Downtown St. Catharines', 'Port Dalhousie', 'Merritton', 'Western Hill'] },
    { slug: 'niagara-falls', name: 'Niagara Falls', region: 'Niagara Region', neighbourhoods: ['Lundy’s Lane', 'Chippawa', 'Stamford'] },
    { slug: 'welland', name: 'Welland', region: 'Niagara Region', neighbourhoods: ['Downtown Welland', 'Dain City', 'Chippawa Park'] },
  ];

  const users: UserRecord[] = [
    {
      id: 'usr_cust_1',
      name: 'Alex Chen',
      email: 'alex.customer@fixsoon.demo',
      phone: '416-555-0142',
      role: 'customer',
      password_hash: demoPass,
      city: 'Toronto',
      company_id: null,
      is_demo: true,
      is_active: true,
      saved_provider_ids: ['prov_marcus'],
      created_at: now,
    },
    {
      id: 'usr_prov_1',
      name: 'Marcus Miller',
      email: 'marcus.auto@fixsoon.demo',
      phone: '416-555-0188',
      role: 'provider',
      password_hash: demoPass,
      city: 'Toronto',
      company_id: null,
      is_demo: true,
      is_active: true,
      saved_provider_ids: [],
      created_at: now,
    },
    {
      id: 'usr_prov_2',
      name: 'Sarah Jenkins',
      email: 'sarah.tech@fixsoon.demo',
      phone: '905-555-0164',
      role: 'provider',
      password_hash: demoPass,
      city: 'Mississauga',
      company_id: null,
      is_demo: true,
      is_active: true,
      saved_provider_ids: [],
      created_at: now,
    },
    {
      id: 'usr_prov_3',
      name: 'David Patel',
      email: 'david.pending@fixsoon.demo',
      phone: '905-555-0199',
      role: 'provider',
      password_hash: demoPass,
      city: 'Brampton',
      company_id: null,
      is_demo: true,
      is_active: true,
      saved_provider_ids: [],
      created_at: now,
    },
    {
      id: 'usr_admin_1',
      name: 'WorldLeo Operations',
      email: 'admin@fixsoon.demo',
      phone: '416-555-0100',
      role: 'admin',
      password_hash: demoPass,
      city: 'Toronto',
      company_id: null,
      is_demo: true,
      is_active: true,
      saved_provider_ids: [],
      created_at: now,
    },
  ];

  const providers: ProviderProfile[] = [
    {
      id: 'prov_marcus',
      user_id: 'usr_prov_1',
      company_id: null,
      slug: 'marcus-miller-mobile-auto',
      display_name: 'Marcus Miller',
      business_name: 'Miller Mobile Auto & Roadside',
      provider_type: 'mobile_technician',
      bio: 'Red Seal automotive technician with 11 years of mobile diagnostics, starter/alternator repair, battery replacement, and FixSoon roadside assistance across Toronto and Mississauga.',
      avatar_url: '/src/assets/images/provider_avatar_1_1794446298913.jpg',
      primary_city: 'Toronto',
      coverage_cities: ['Toronto', 'Mississauga', 'Etobicoke', 'North York', 'Scarborough'],
      coverage_radius_km: 35,
      category_ids: ['cat_auto'],
      subcategory_ids: ['sub_roadside', 'sub_mobile_mech', 'sub_battery_boost', 'sub_battery_replace', 'sub_flat_tire', 'sub_diagnostics'],
      languages: ['English'],
      years_experience: 11,
      starting_price: 75,
      diagnostic_fee: 85,
      free_estimates: true,
      pricing_notes: 'Diagnostic fee is waived toward repair labour if approved on-site.',
      operating_hours: 'Mon–Sat 7:00 AM – 9:00 PM',
      emergency_available: true,
      is_available_now: true,
      status: 'approved',
      verifications: {
        email_verified: true,
        phone_verified: true,
        business_verified: true,
        license_verified: true,
        insurance_verified: true,
        profile_reviewed: true,
      },
      rating_avg: 4.9,
      review_count: 2,
      completed_jobs_count: 2,
      is_demo: true,
      created_at: now,
    },
    {
      id: 'prov_sarah',
      user_id: 'usr_prov_2',
      company_id: null,
      slug: 'sarah-jenkins-gta-technical',
      display_name: 'Sarah Jenkins',
      business_name: 'Jenkins Fleet & Mobile Tire Care',
      provider_type: 'independent_professional',
      bio: 'Independent mobile mechanic and tire specialist serving Peel and West Toronto for cars, pickup trucks, utility trailers, and compact Bobcat/skid-steer equipment.',
      avatar_url: '/src/assets/images/provider_avatar_2_1794446299392.jpg',
      primary_city: 'Mississauga',
      coverage_cities: ['Mississauga', 'Brampton', 'Oakville', 'Burlington', 'Hamilton', 'Toronto'],
      coverage_radius_km: 45,
      category_ids: ['cat_auto'],
      subcategory_ids: ['sub_mobile_mech', 'sub_flat_tire', 'sub_battery_boost', 'sub_battery_replace', 'sub_roadside'],
      languages: ['English', 'French'],
      years_experience: 8,
      starting_price: 65,
      diagnostic_fee: 75,
      free_estimates: true,
      pricing_notes: 'Upfront written quote before any parts are ordered.',
      operating_hours: 'Mon–Sun 8:00 AM – 8:00 PM',
      emergency_available: false,
      is_available_now: true,
      status: 'approved',
      verifications: {
        email_verified: true,
        phone_verified: true,
        business_verified: true,
        license_verified: false,
        insurance_verified: true,
        profile_reviewed: true,
      },
      rating_avg: 4.8,
      review_count: 1,
      completed_jobs_count: 1,
      is_demo: true,
      created_at: now,
    },
    {
      id: 'prov_david',
      user_id: 'usr_prov_3',
      company_id: null,
      slug: 'david-patel-peel-roadside',
      display_name: 'David Patel',
      business_name: 'Peel Tire & Roadside Support',
      provider_type: 'registered_business',
      bio: 'Mobile tire changes, flat repairs, and battery boosts in Brampton, Vaughan, and Mississauga. Application submitted for WorldLeo verification.',
      avatar_url: '',
      primary_city: 'Brampton',
      coverage_cities: ['Brampton', 'Mississauga', 'Vaughan'],
      coverage_radius_km: 25,
      category_ids: ['cat_auto'],
      subcategory_ids: ['sub_roadside', 'sub_battery_boost', 'sub_flat_tire'],
      languages: ['English', 'Hindi', 'Punjabi'],
      years_experience: 5,
      starting_price: 60,
      diagnostic_fee: 0,
      free_estimates: true,
      pricing_notes: 'Flat-rate tire swap and jumpstart pricing.',
      operating_hours: 'Daily 7:00 AM – 10:00 PM',
      emergency_available: true,
      is_available_now: true,
      status: 'pending_verification',
      verifications: {
        email_verified: true,
        phone_verified: true,
        business_verified: false,
        license_verified: false,
        insurance_verified: false,
        profile_reviewed: false,
      },
      rating_avg: 0,
      review_count: 0,
      completed_jobs_count: 0,
      is_demo: true,
      created_at: now,
    },
  ];

  const reviews: Review[] = [
    {
      id: 'rev_1',
      job_id: 'job_demo_1',
      customer_id: 'usr_cust_1',
      customer_name: 'Alex C.',
      provider_id: 'prov_marcus',
      rating: 5,
      comment: 'Arrived in North York within 35 minutes, tested the alternator and replaced the dead battery on the spot. Clear pricing.',
      service_name: 'Mobile Battery Replacement',
      is_demo: true,
      created_at: '2026-10-18T14:30:00.000Z',
    },
    {
      id: 'rev_2',
      job_id: 'job_demo_2',
      customer_id: 'usr_cust_1',
      customer_name: 'Jordan T.',
      provider_id: 'prov_marcus',
      rating: 5,
      comment: 'Found a seized brake caliper pin during a driveway inspection and showed me the worn part before quoting.',
      service_name: 'Mobile Mechanic',
      is_demo: true,
      created_at: '2026-10-25T16:15:00.000Z',
    },
    {
      id: 'rev_3',
      job_id: 'job_demo_3',
      customer_id: 'usr_cust_1',
      customer_name: 'Priya S.',
      provider_id: 'prov_sarah',
      rating: 5,
      comment: 'Swapped a blown tandem-axle trailer tire in Mississauga and checked the hub bearings before we got back on the QEW.',
      service_name: 'Flat Tire Service (Cars, Trucks, Bobcat & Trailers)',
      is_demo: true,
      created_at: '2026-11-02T11:00:00.000Z',
    },
  ];

  return {
    schema_version: CURRENT_SCHEMA_VERSION,
    users,
    service_categories: categories,
    service_subcategories: subcategories,
    gta_locations: gtaLocations,
    provider_profiles: providers,
    service_requests: [],
    request_matches: [],
    quotes: [],
    jobs: [],
    messages: [],
    reviews,
    disputes: [],
    notifications: [],
    audit_logs: [
      {
        id: 'aud_1',
        actor_id: 'usr_admin_1',
        actor_name: 'WorldLeo Operations',
        action: 'SYSTEM_SEED',
        target_type: 'platform',
        target_id: 'worldleo_ontario',
        details: 'Initialized WorldLeo Home, WorldLeo Auto, FixSoon Roadside, locations, and sample demo providers.',
        created_at: now,
      },
    ],
  };
}

export class FixSoonDatabase {
  private state!: DatabaseState;
  private filePath: string;
  private txQueue: Promise<void> = Promise.resolve();
  private saveCounter = 0;

  constructor(filePath: string = DEFAULT_DB_FILE) {
    this.filePath = path.resolve(filePath);
    this.loadFromDisk();
  }

  private ensureDir(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadFromDisk(): void {
    this.ensureDir();
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw) as DatabaseState;
        this.state = this.migrateNonDestructively(parsed);
        return;
      } catch {
        this.state = createSeedState();
        this.save();
        return;
      }
    }
    this.state = createSeedState();
    this.save();
  }

  /**
   * Non-destructive migration: preserves ALL existing user, provider, request,
   * match, quote, job, message, review, dispute, notification, and audit data.
   */
  private migrateNonDestructively(existing: DatabaseState): DatabaseState {
    const seed = createSeedState();
    let changed = false;

    const state: DatabaseState = {
      schema_version: existing.schema_version || 1,
      users: Array.isArray(existing.users) ? existing.users : seed.users,
      service_categories: Array.isArray(existing.service_categories) ? existing.service_categories : [],
      service_subcategories: Array.isArray(existing.service_subcategories) ? existing.service_subcategories : [],
      gta_locations: Array.isArray(existing.gta_locations) ? existing.gta_locations : seed.gta_locations,
      provider_profiles: Array.isArray(existing.provider_profiles) ? existing.provider_profiles : [],
      service_requests: Array.isArray(existing.service_requests) ? existing.service_requests : [],
      request_matches: Array.isArray(existing.request_matches) ? existing.request_matches : [],
      quotes: Array.isArray(existing.quotes) ? existing.quotes : [],
      jobs: Array.isArray(existing.jobs) ? existing.jobs : [],
      messages: Array.isArray(existing.messages) ? existing.messages : [],
      reviews: Array.isArray(existing.reviews) ? existing.reviews : [],
      disputes: Array.isArray(existing.disputes) ? existing.disputes : [],
      notifications: Array.isArray(existing.notifications) ? existing.notifications : [],
      audit_logs: Array.isArray(existing.audit_logs) ? existing.audit_logs : [],
    };

    if ((state.schema_version || 1) < CURRENT_SCHEMA_VERSION) {
      const backupPath = `${this.filePath}.pre-v${CURRENT_SCHEMA_VERSION}.backup.json`;
      if (!fs.existsSync(backupPath)) {
        fs.writeFileSync(backupPath, JSON.stringify(existing, null, 2), 'utf8');
      }
      changed = true;
    }

    // Backfill is_demo & is_active flags without touching passwords or user profiles
    for (const user of state.users) {
      if (user.is_active === undefined) {
        user.is_active = true;
        changed = true;
      }
      if (user.is_demo === undefined && user.email.toLowerCase().endsWith('.demo')) {
        user.is_demo = true;
        changed = true;
      }
    }

    // Merge canonical categories (cat_auto, cat_home) while keeping any admin-created categories
    for (const seedCat of seed.service_categories) {
      const existingCat = state.service_categories.find((c) => c.id === seedCat.id);
      if (!existingCat) {
        state.service_categories.push(seedCat);
        changed = true;
      } else if ((state.schema_version || 1) < CURRENT_SCHEMA_VERSION) {
        existingCat.division = seedCat.division;
        existingCat.name = seedCat.name;
        existingCat.description = seedCat.description;
        existingCat.is_active = seedCat.is_active;
        existingCat.seo_title = seedCat.seo_title;
        existingCat.seo_description = seedCat.seo_description;
        existingCat.dynamic_fields = seedCat.dynamic_fields;
        changed = true;
      }
    }

    // Merge missing canonical subcategories while preserving existing ones
    for (const seedSub of seed.service_subcategories) {
      const existingSub = state.service_subcategories.find((s) => s.id === seedSub.id);
      if (!existingSub) {
        state.service_subcategories.push(seedSub);
        changed = true;
      } else if ((state.schema_version || 1) < CURRENT_SCHEMA_VERSION) {
        existingSub.name = seedSub.name;
        existingSub.description = seedSub.description;
        existingSub.seo_title = seedSub.seo_title;
        existingSub.seo_description = seedSub.seo_description;
        changed = true;
      }
    }

    // Ensure all Ontario locations exist without removing any
    for (const seedLoc of seed.gta_locations) {
      if (!state.gta_locations.some((l) => l.slug === seedLoc.slug)) {
        state.gta_locations.push(seedLoc);
        changed = true;
      }
    }

    if ((state.schema_version || 1) < CURRENT_SCHEMA_VERSION) {
      state.schema_version = CURRENT_SCHEMA_VERSION;
      changed = true;
    }

    this.state = state;
    if (changed) {
      this.save();
    }
    return state;
  }

  get data(): DatabaseState {
    return this.state;
  }

  get dbPath(): string {
    return this.filePath;
  }

  /**
   * Serializes state mutations through an internal FIFO transaction queue
   * with full in-memory snapshot rollback on failure and atomic file replacement.
   */
  async runTransaction<T>(fn: () => Promise<T> | T): Promise<T> {
    let release!: () => void;
    const prevQueue = this.txQueue;
    this.txQueue = new Promise<void>((resolve) => {
      release = resolve;
    });

    await prevQueue;
    const snapshot = structuredClone(this.state);
    try {
      const result = await fn();
      this.save();
      return result;
    } catch (err) {
      this.state = snapshot;
      throw err;
    } finally {
      release();
    }
  }

  save(): void {
    this.ensureDir();
    this.saveCounter += 1;
    const tmp = `${this.filePath}.${process.pid}.${this.saveCounter}.tmp`;
    const serialized = JSON.stringify(this.state, null, 2);
    const fd = fs.openSync(tmp, 'w', 0o600);
    try {
      fs.writeFileSync(fd, serialized, 'utf8');
      fs.fsyncSync(fd);
    } finally {
      fs.closeSync(fd);
    }
    fs.renameSync(tmp, this.filePath);
  }

  useFileForTests(tempFilePath: string): void {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot switch database file in production.');
    }
    this.filePath = path.resolve(tempFilePath);
    this.txQueue = Promise.resolve();
    this.loadFromDisk();
  }

  resetWithSeedForTests(): void {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot reset database in production.');
    }
    this.state = createSeedState();
    this.save();
  }

  newId(prefix: string): string {
    return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
  }

  newRefCode(): string {
    const num = Math.floor(100000 + crypto.randomInt(0, 900000));
    return `WL-${num}`;
  }
}

export const db = new FixSoonDatabase();
