import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Heart, ShieldAlert, Award, Building2, CheckCircle, ArrowRight, UserPlus, FileText } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import LiveRequestsFeed from '../../components/common/LiveRequestsFeed';
import DonorCard from '../../components/common/DonorCard';
import HospitalCard from '../../components/common/HospitalCard';
import BloodGroupBadge from '../../components/common/BloodGroupBadge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Card, CardContent } from '../../components/ui/Card';
import searchService from '../../services/searchService';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [searchBg, setSearchBg] = useState('O+');
  const [searchCity, setSearchCity] = useState('');
  const [searchRadius, setSearchRadius] = useState('25');

  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [livesSaved, setLivesSaved] = useState(0);

  // Load mock/real public data on mount
  useEffect(() => {
    const loadPublicData = async () => {
      try {
        const donorRes = await searchService.searchDonors({ limit: 6 });
        const hospRes = await searchService.searchHospitals({ limit: 4 });
        
        setDonors(donorRes.donors || donorRes.data || []);
        setHospitals(hospRes.hospitals || hospRes.data || []);
      } catch (err) {
        console.error('Failed to load public donors/hospitals list:', err);
      }
    };
    loadPublicData();

    // Stats counter animation on load
    let count = 0;
    const interval = setInterval(() => {
      count += 137;
      if (count >= 12043) {
        setLivesSaved(12043);
        clearInterval(interval);
      } else {
        setLivesSaved(count);
      }
    }, 15);

    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/signup?bloodGroup=${searchBg}&city=${searchCity}&radius=${searchRadius}`);
  };

  // Generate 8 floating blood drop particles with staggered styles
  const particles = Array.from({ length: 8 });

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body relative overflow-hidden select-none">
      
      {/* Dynamic Floating Blood Drops */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {particles.map((_, i) => (
          <div
            key={i}
            className="animate-blood-particles select-none text-blood/25 text-2xl"
            style={{
              left: `${10 + i * 12}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${6 + (i % 3) * 2}s`
            }}
          >
            🩸
          </div>
        ))}
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[95vh] flex items-center justify-center pt-24 pb-12 overflow-hidden gradient-mesh z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Staggered Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left gap-6"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blood/10 border border-blood/20 text-blood text-xs font-bold font-mono tracking-widest uppercase animate-pulse">
              🩸 Live Emergency Coordination
            </span>

            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl xl:text-8xl tracking-wider leading-none text-text-primary uppercase">
              Every Drop <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blood-glow via-blood to-blood-dark drop-shadow-[0_0_15px_rgba(200,16,46,0.3)]">
                Saves A Life
              </span>
            </h1>

            <p className="text-sm sm:text-base text-text-muted max-w-lg leading-relaxed font-light">
              Connect instantly with verified blood donors, medical institutions, and coordinate urgent SOS broadcasts during critical, life-threatening care situations.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/signup')}
                className="animate-sos-pulse-ring"
                icon={<Search className="w-5 h-5" />}
              >
                Need Blood Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/signup')}
                icon={<Heart className="w-5 h-5 text-blood fill-current" />}
              >
                Become A Donor
              </Button>
            </div>

            {/* Animated counter readout */}
            <div className="grid grid-cols-3 gap-6 mt-6 border-t border-border/80 pt-6 w-full max-w-md font-mono text-center lg:text-left">
              <div>
                <span className="text-xl sm:text-2xl font-bold text-text-primary font-display block">2,847</span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Donors Registered</span>
              </div>
              <div className="border-x border-border/80 px-4">
                <span className="text-xl sm:text-2xl font-bold text-text-primary font-display block">156</span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Hospitals Partnered</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-blood-glow font-display block">
                  {livesSaved.toLocaleString()}+
                </span>
                <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Lives Safeguarded</span>
              </div>
            </div>
          </motion.div>

          {/* Right side animated ECG line */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 hidden lg:flex flex-col items-center justify-center relative p-8 glass-panel border-white/5 rounded-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-blood/5 to-transparent pointer-events-none rounded-3xl" />
            <svg className="w-full h-44 text-blood overflow-visible" viewBox="0 0 600 200">
              <path
                className="animate-heartbeat-line"
                fill="none"
                stroke="#FF1744"
                strokeWidth="3.5"
                d="M0,100 L150,100 L170,80 L190,120 L210,100 L240,100 L255,40 L270,160 L285,100 L320,100 L330,90 L340,110 L350,100 L600,100"
              />
            </svg>
            <span className="text-[10px] font-mono text-blood-glow font-bold tracking-widest uppercase mt-4 animate-pulse">
              ECG Frequency Monitor Active
            </span>
          </motion.div>
        </div>
      </section>

      {/* Live Emergency Ticker Broadcast */}
      <LiveRequestsFeed />

      {/* Blood Search Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <Card className="border-t-4 border-t-blood shadow-blood/10">
          <CardContent className="p-6 sm:p-8">
            <h3 className="font-display text-2xl sm:text-3xl text-text-primary tracking-wider uppercase mb-2">
              Find Blood Near You — Right Now
            </h3>
            <p className="text-xs text-text-muted mb-6">
              Enter target requirements to geospatially locate matched inventory levels and available donor profiles.
            </p>
            
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 items-end">
              <Select
                label="Required Blood Group"
                value={searchBg}
                onChange={(e) => setSearchBg(e.target.value)}
                options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
              />

              <Input
                label="City Name"
                placeholder="e.g. Bangalore"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
              />

              <Select
                label="Coordinates Radius"
                value={searchRadius}
                onChange={(e) => setSearchRadius(e.target.value)}
                options={[
                  { label: '10 km', value: '10' },
                  { label: '25 km', value: '25' },
                  { label: '50 km', value: '50' }
                ]}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3.5 uppercase font-display font-bold tracking-wider"
                icon={<Search className="w-4 h-4" />}
              >
                Locate matched donors
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Verified Donors Horizontal Row */}
      <section className="py-12 bg-surface-2/20 border-y border-border/80 w-full overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="font-display text-2xl sm:text-3xl text-text-primary tracking-wider uppercase">
                Our Verified Donors
              </h3>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">
                Eligible, verified heroes available in localized municipalities.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/signup')}
              className="text-xs border-white/10"
              icon={<UserPlus className="w-3.5 h-3.5 text-blood" />}
            >
              Become a Donor
            </Button>
          </div>

          {donors.length === 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 select-none">
              {/* Seeded fallback mock donors row if database is empty */}
              <DonorCard donor={{ name: 'Amit Kumar', city: 'Bangalore', bloodGroup: 'O+', totalDonations: 12, isAvailable: true, isVerified: true }} />
              <DonorCard donor={{ name: 'Sara Khan', city: 'Bangalore', bloodGroup: 'AB-', totalDonations: 4, isAvailable: false, isVerified: true }} />
              <DonorCard donor={{ name: 'Vikram Singh', city: 'Mumbai', bloodGroup: 'A+', totalDonations: 9, isAvailable: true, isVerified: true }} />
              <DonorCard donor={{ name: 'Sneha Patel', city: 'Mumbai', bloodGroup: 'B+', totalDonations: 6, isAvailable: true, isVerified: true }} />
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth">
              {donors.map((donor) => (
                <DonorCard key={donor._id || donor.name} donor={donor} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Verified Clinics & Stocks Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="font-display text-2xl sm:text-3xl text-text-primary tracking-wider uppercase">
              Partnering Hospitals & Blood Banks
            </h3>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Medical facilities managing verified in-house blood inventory stock volumes.
            </p>
          </div>
        </div>

        {hospitals.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HospitalCard
              hospital={{ institutionName: 'City Care Hospital', institutionType: 'hospital', address: 'MG Road', city: 'Bangalore', isVerified: true, phone: '9876543210' }}
              stock={[
                { bloodGroup: 'A+', availableUnits: 12 },
                { bloodGroup: 'B+', availableUnits: 18 },
                { bloodGroup: 'O+', availableUnits: 22 },
                { bloodGroup: 'AB+', availableUnits: 6 }
              ]}
            />
            <HospitalCard
              hospital={{ institutionName: 'Metro Blood Bank', institutionType: 'blood_bank', address: 'Indiranagar', city: 'Bangalore', isVerified: true, phone: '8765432109' }}
              stock={[
                { bloodGroup: 'O-', availableUnits: 4 },
                { bloodGroup: 'A-', availableUnits: 8 },
                { bloodGroup: 'B-', availableUnits: 9 },
                { bloodGroup: 'AB-', availableUnits: 2 }
              ]}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hospitals.map((hosp) => (
              <HospitalCard key={hosp._id || hosp.institutionName} hospital={hosp} stock={hosp.stock || []} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-surface-2/10 border-t border-border/80 w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="font-display text-2xl sm:text-3xl text-text-primary tracking-wider uppercase mb-12">
            Automated Emergency Match Cycle
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blood/10 border border-blood/20 flex items-center justify-center font-display text-xl text-blood font-bold shadow-blood">
                1
              </div>
              <h4 className="text-sm font-bold text-text-primary mt-2">Register & Verify</h4>
              <p className="text-xs text-text-muted leading-relaxed max-w-xs">
                Register in seconds as a Seeker, Donor, or Hospital. Access credentials are encrypted immediately.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blood/10 border border-blood/20 flex items-center justify-center font-display text-xl text-blood font-bold shadow-blood">
                2
              </div>
              <h4 className="text-sm font-bold text-text-primary mt-2">Broadcast SOS</h4>
              <p className="text-xs text-text-muted leading-relaxed max-w-xs">
                Post blood requests with coordinates. Toggle critical alerts to trigger city-wide socket signals.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blood/10 border border-blood/20 flex items-center justify-center font-display text-xl text-blood font-bold shadow-blood">
                3
              </div>
              <h4 className="text-sm font-bold text-text-primary mt-2">Locate & Coordinate</h4>
              <p className="text-xs text-text-muted leading-relaxed max-w-xs">
                Matched available donors and hospitals receive alerts instantly, coordinating coordinates and phone numbers.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blood/10 border border-blood/20 flex items-center justify-center font-display text-xl text-blood font-bold shadow-blood">
                4
              </div>
              <h4 className="text-sm font-bold text-text-primary mt-2">Donate & Complete</h4>
              <p className="text-xs text-text-muted leading-relaxed max-w-xs">
                Complete contributions on-site. Donors earn eligibility counters, and patients receive verified care.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
