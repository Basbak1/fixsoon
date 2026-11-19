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
  saved_provider_ids: string[];
  created_at: string;
}

export interface DatabaseState {
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
const DB_FILE = path.join(DATA_DIR, 'fixsoon.json');

function createSeedState(): DatabaseState {
  const demoPass = hashPassword('FixSoon2026!');
  const now = new Date().toISOString();

  const categories: ServiceCategory[] = [
    {
      id: 'cat_auto',
      slug: 'automotive-roadside',
      name: 'Mobile Mechanic & Flat Tire Services',
      description: 'On-site mobile mechanics, flat tire repair & replacement, battery boosts, and diagnostics for cars, trucks, Bobcats, skid steers, and trailers.',
      image_url: '/src/assets/images/category_automotive_1794446299137.jpg',
      is_active: true,
      seo_title: 'Mobile Mechanic & Flat Tire Service (Cars, Trucks, Bobcat & Trailers) | FixSoon',
      seo_description: 'Connect with independent mobile mechanics and flat tire specialists for cars, trucks, Bobcats, and trailers across Toronto and the GTA.',
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
        { key: 'can_vehicle_move', label: 'Can it be driven or moved safely?', type: 'select', required: true, options: ['No, it will not start or move', 'Yes, but warning light or noise present', 'Not sure'] },
      ],
    },
    {
      id: 'cat_home',
      slug: 'home-services',
      name: 'Home & Appliance Services',
      description: 'Future expansion category: independent appliance repair, plumbing fixtures, electrical troubleshooting, and general home maintenance.',
      image_url: '/src/assets/images/category_home_appliance_1794446298673.jpg',
      is_active: false,
      seo_title: 'Home Appliance Repair, Plumbing & Electrical Services | FixSoon',
      seo_description: 'Find independent appliance repair technicians, plumbers, and electricians in the Greater Toronto Area.',
      dynamic_fields: [
        { key: 'appliance_or_fixture', label: 'Appliance or fixture type', type: 'text', required: true, placeholder: 'e.g. Front-load washing machine, kitchen faucet' },
        { key: 'manufacturer', label: 'Brand / Manufacturer (if known)', type: 'text', required: false, placeholder: 'e.g. LG, Samsung, Moen' },
        { key: 'model_number', label: 'Model number (optional)', type: 'text', required: false, placeholder: 'e.g. WM3900HWA' },
        { key: 'property_type', label: 'Property type', type: 'select', required: true, options: ['Detached / Semi-detached house', 'Townhouse', 'Condo / Apartment', 'Commercial space'] },
      ],
    },
  ];

  const subcategories: ServiceSubcategory[] = [
    {
      id: 'sub_mobile_mech',
      category_id: 'cat_auto',
      slug: 'mobile-mechanic',
      name: 'Mobile Mechanic (Cars, Trucks, Bobcat & Trailers)',
      description: 'On-site diagnostics, starter/alternator repairs, brakes, hydraulic & diesel troubleshooting, and inspections for cars, trucks, Bobcats, and trailers.',
      keywords: ['mechanic', 'repair', 'engine', 'noise', 'brake', 'alternator', 'starter', 'inspection', 'truck', 'bobcat', 'skid steer', 'trailer', 'diesel', 'hydraulic', 'equipment'],
      typical_duration: '1–2 hours',
      seo_title: 'Mobile Mechanic for Cars, Trucks, Bobcat & Trailers in the GTA | FixSoon',
      seo_description: 'Compare quotes from independent mobile mechanics for cars, trucks, Bobcats, and trailers in Toronto, Mississauga, and Brampton.',
    },
    {
      id: 'sub_flat_tire',
      category_id: 'cat_auto',
      slug: 'flat-tire-assistance',
      name: 'Flat Tire Service (Cars, Trucks, Bobcat & Trailers)',
      description: 'Mobile flat tire repair, spare mounting, heavy-duty truck & trailer tire swaps, Bobcat/skid-steer tire service, and blowout assistance.',
      keywords: ['flat tire', 'flat', 'tire', 'puncture', 'nail', 'blowout', 'spare tire', 'tire change', 'rim', 'truck', 'trailer', 'bobcat', 'skid steer', 'lug', 'patch', 'plug'],
      typical_duration: '30–60 mins',
      seo_title: 'Flat Tire Service for Cars, Trucks, Bobcat & Trailers GTA | FixSoon',
      seo_description: 'Flat tire on a car, truck, Bobcat, or trailer in the GTA? Request an independent mobile tire technician on FixSoon.',
    },
    {
      id: 'sub_roadside',
      category_id: 'cat_auto',
      slug: 'roadside-assistance',
      name: 'Roadside Assistance',
      description: 'On-the-spot emergency help for stranded cars, work trucks, and trailers including boosts, lockouts, and urgent roadside support.',
      keywords: ['stranded', 'roadside', 'emergency', 'tow', 'stuck', 'help', 'highway', 'truck', 'trailer'],
      typical_duration: '30–60 mins',
      seo_title: 'Roadside Assistance in Toronto & GTA | FixSoon',
      seo_description: 'Request fast roadside assistance from independent professionals across Toronto, Mississauga, Brampton, and the GTA.',
    },
    {
      id: 'sub_battery_boost',
      category_id: 'cat_auto',
      slug: 'battery-boost',
      name: 'Battery Boost & Jumpstart',
      description: 'Safe commercial-grade 12V/24V jumpstart and charging system check for cars, trucks, Bobcats, and equipment.',
      keywords: ['wont start', "won't start", 'dead battery', 'jump', 'boost', 'click', 'no crank', 'car dead', 'truck', 'bobcat'],
      typical_duration: '20–40 mins',
      seo_title: 'Battery Boost & Jumpstart Service in the GTA | FixSoon',
      seo_description: 'Dead battery on a car, truck, or job-site equipment? Find independent technicians for a safe boost and charging test.',
    },
    {
      id: 'sub_battery_replace',
      category_id: 'cat_auto',
      slug: 'battery-replacement',
      name: 'Mobile Battery Replacement',
      description: 'On-site battery testing, removal, and installation of a compatible replacement battery for cars, trucks, and equipment.',
      keywords: ['battery replacement', 'new battery', 'battery dead', 'corroded', 'replace battery', 'truck', 'bobcat'],
      typical_duration: '30–60 mins',
      seo_title: 'Mobile Battery Replacement in Toronto & GTA | FixSoon',
      seo_description: 'Get quotes for mobile battery replacement at home, job site, or roadside in the GTA.',
    },
    {
      id: 'sub_diagnostics',
      category_id: 'cat_auto',
      slug: 'vehicle-diagnostics',
      name: 'Vehicle & Equipment Diagnostics',
      description: 'OBD-II & heavy-duty fault code scanning, electrical tracing, trailer wiring checks, and pre-purchase inspections.',
      keywords: ['check engine', 'light', 'diagnostic', 'scan', 'code', 'electrical', 'inspection', 'trailer wiring', 'bobcat', 'truck'],
      typical_duration: '45–90 mins',
      seo_title: 'Mobile Vehicle & Equipment Diagnostics in the GTA | FixSoon',
      seo_description: 'Book an independent mobile technician for diagnostics and pre-purchase inspections in the GTA.',
    },
    {
      id: 'sub_washer',
      category_id: 'cat_home',
      slug: 'washing-machine-repair',
      name: 'Washing Machine & Dryer Repair',
      description: 'Troubleshooting leaks, drain pump failures, spin issues, and heating problems for laundry appliances.',
      keywords: ['washing machine', 'washer', 'dryer', 'leaking', 'spin', 'drain', 'laundry'],
      typical_duration: '1–2 hours',
      seo_title: 'Washing Machine & Dryer Repair in the GTA | FixSoon',
      seo_description: 'Find independent appliance technicians for washing machine and dryer repairs across Toronto and the GTA.',
    },
    {
      id: 'sub_fridge',
      category_id: 'cat_home',
      slug: 'refrigerator-repair',
      name: 'Refrigerator & Stove Repair',
      description: 'Cooling diagnostics, thermostat replacement, oven elements, and kitchen appliance servicing.',
      keywords: ['fridge', 'refrigerator', 'freezer', 'stove', 'oven', 'not cooling', 'appliance'],
      typical_duration: '1–2 hours',
      seo_title: 'Refrigerator & Kitchen Appliance Repair GTA | FixSoon',
      seo_description: 'Request quotes from independent refrigerator and stove repair specialists in the Greater Toronto Area.',
    },
    {
      id: 'sub_plumbing',
      category_id: 'cat_home',
      slug: 'plumbing-fixtures',
      name: 'Plumbing & Fixture Repair',
      description: 'Leaking faucets, toilet repairs, P-trap clearing, and fixture installations.',
      keywords: ['faucet', 'leak', 'leaking', 'plumbing', 'toilet', 'sink', 'pipe', 'drain'],
      typical_duration: '1–2 hours',
      seo_title: 'Plumbing & Faucet Repair Services in the GTA | FixSoon',
      seo_description: 'Connect with local plumbing and fixture repair professionals in Toronto, Mississauga, and Brampton.',
    },
    {
      id: 'sub_electrical',
      category_id: 'cat_home',
      slug: 'electrical-handyman',
      name: 'Electrical & General Maintenance',
      description: 'Outlet troubleshooting, lighting installation, furniture assembly, and general home maintenance.',
      keywords: ['electrical', 'outlet', 'light', 'breaker', 'switch', 'handyman', 'assembly'],
      typical_duration: '1–3 hours',
      seo_title: 'Electrical & Home Maintenance Professionals GTA | FixSoon',
      seo_description: 'Find qualified professionals for lighting, electrical troubleshooting, and home maintenance.',
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
      saved_provider_ids: [],
      created_at: now,
    },
    {
      id: 'usr_admin_1',
      name: 'FixSoon Operations',
      email: 'admin@fixsoon.demo',
      phone: '416-555-0100',
      role: 'admin',
      password_hash: demoPass,
      city: 'Toronto',
      saved_provider_ids: [],
      created_at: now,
    },
  ];

  const providers: ProviderProfile[] = [
    {
      id: 'prov_marcus',
      user_id: 'usr_prov_1',
      slug: 'marcus-miller-mobile-auto',
      display_name: 'Marcus Miller',
      business_name: 'Miller Mobile Auto & Roadside',
      provider_type: 'mobile_technician',
      bio: 'Red Seal automotive technician with 11 years of mobile diagnostics, starter/alternator repair, battery replacement, and roadside assistance across Toronto and Mississauga.',
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
      slug: 'david-patel-peel-roadside',
      display_name: 'David Patel',
      business_name: 'Peel Tire & Roadside Support',
      provider_type: 'registered_business',
      bio: 'Mobile tire changes, flat repairs, and battery boosts in Brampton, Vaughan, and Mississauga. Application submitted for FixSoon verification.',
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
      created_at: '2026-11-02T11:00:00.000Z',
    },
  ];

  return {
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
        actor_name: 'FixSoon Operations',
        action: 'SYSTEM_SEED',
        target_type: 'platform',
        target_id: 'fixsoon_gta',
        details: 'Initialized GTA demo marketplace categories, locations, and sample providers.',
        created_at: now,
      },
    ],
  };
}

class FixSoonDatabase {
  private state: DatabaseState;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.state = JSON.parse(raw) as DatabaseState;
        const seed = createSeedState();
        const homeCat = this.state.service_categories.find((c) => c.id === 'cat_home');
        const autoCat = this.state.service_categories.find((c) => c.id === 'cat_auto');
        const needsLaunchSync =
          (homeCat && homeCat.is_active) ||
          (autoCat && !autoCat.dynamic_fields.some((f) => f.key === 'equipment_type'));
        const needsLocationSync = !this.state.gta_locations.some((l) => l.slug === 'hamilton');
        if (needsLaunchSync || needsLocationSync) {
          this.state.service_categories = seed.service_categories;
          this.state.service_subcategories = seed.service_subcategories;
          this.state.gta_locations = seed.gta_locations;
          const sarah = this.state.provider_profiles.find((p) => p.id === 'prov_sarah');
          const seedSarah = seed.provider_profiles.find((p) => p.id === 'prov_sarah');
          if (sarah && seedSarah) {
            sarah.business_name = seedSarah.business_name;
            sarah.bio = seedSarah.bio;
            sarah.category_ids = seedSarah.category_ids;
            sarah.subcategory_ids = seedSarah.subcategory_ids;
            sarah.coverage_cities = seedSarah.coverage_cities;
            sarah.coverage_radius_km = seedSarah.coverage_radius_km;
          }
          const rev3 = this.state.reviews.find((r) => r.id === 'rev_3');
          const seedRev3 = seed.reviews.find((r) => r.id === 'rev_3');
          if (rev3 && seedRev3) {
            rev3.comment = seedRev3.comment;
            rev3.service_name = seedRev3.service_name;
          }
          this.save();
        }
      } catch {
        this.state = createSeedState();
        this.save();
      }
    } else {
      this.state = createSeedState();
      this.save();
    }
  }

  get data(): DatabaseState {
    return this.state;
  }

  save(): void {
    const tmp = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.state, null, 2), 'utf8');
    fs.renameSync(tmp, DB_FILE);
  }

  newId(prefix: string): string {
    return `${prefix}_${crypto.randomBytes(6).toString('hex')}`;
  }

  newRefCode(): string {
    const num = Math.floor(100000 + Math.random() * 900000);
    return `FX-${num}`;
  }
}

export const db = new FixSoonDatabase();
