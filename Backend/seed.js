require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const DonorProfile = require('./models/DonorProfile');
const HospitalProfile = require('./models/HospitalProfile');
const BloodStock = require('./models/BloodStock');
const BloodRequest = require('./models/BloodRequest');
const Notification = require('./models/Notification');
const DonationHistory = require('./models/DonationHistory');

const seedDB = async () => {
  try {
    // Connect to database
    console.log('📡 Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📡 Connected to MongoDB.');

    // Clear existing data
    console.log('🧹 Clearing existing collections...');
    await User.deleteMany({});
    await DonorProfile.deleteMany({});
    await HospitalProfile.deleteMany({});
    await BloodStock.deleteMany({});
    await BloodRequest.deleteMany({});
    await Notification.deleteMany({});
    await DonationHistory.deleteMany({});
    console.log('🧹 Database wiped.');

    // 1. Create Admin User
    console.log('👤 Seeding Admin user...');
    const admin = new User({
      name: 'System Administrator',
      email: 'admin@ebc.com',
      password: 'Admin@123', // Will be automatically hashed by Mongoose pre-save hook
      phone: '+919988776655',
      role: 'admin',
      city: 'Delhi',
      state: 'Delhi',
      location: { type: 'Point', coordinates: [77.1025, 28.7041] },
      isVerified: true,
      isActive: true
    });
    await admin.save();
    console.log('👤 Admin user seeded.');

    // 2. Create Seeker User
    console.log('👤 Seeding Seeker user...');
    const seeker = new User({
      name: 'Ramesh Seeker',
      email: 'seeker@ebc.com',
      password: 'Seeker@123',
      phone: '+919876543210',
      role: 'seeker',
      city: 'Bangalore',
      state: 'Karnataka',
      location: { type: 'Point', coordinates: [77.5946, 12.9716] },
      isVerified: true,
      isActive: true
    });
    await seeker.save();
    console.log('👤 Seeker user seeded.');

    // 3. Create Donors
    console.log('👤 Seeding Donor users and profiles...');
    const donorsData = [
      {
        name: 'Amit Kumar',
        email: 'amit@ebc.com',
        phone: '+919111111111',
        city: 'Bangalore',
        state: 'Karnataka',
        coords: [77.5946, 12.9716],
        bloodGroup: 'O+',
        age: 26,
        gender: 'male',
        weight: 72,
        lastDonationDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago (eligible)
        medicalConditions: []
      },
      {
        name: 'Sara Khan',
        email: 'sara@ebc.com',
        phone: '+919222222222',
        city: 'Bangalore',
        state: 'Karnataka',
        coords: [77.6413, 12.9784], // Indiranagar
        bloodGroup: 'AB-',
        age: 23,
        gender: 'female',
        weight: 56,
        lastDonationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago (not eligible)
        medicalConditions: []
      },
      {
        name: 'John Doe',
        email: 'john@ebc.com',
        phone: '+919333333333',
        city: 'Hyderabad',
        state: 'Telangana',
        coords: [78.4867, 17.3850],
        bloodGroup: 'B+',
        age: 32,
        gender: 'male',
        weight: 80,
        lastDonationDate: null, // Never donated (eligible)
        medicalConditions: []
      },
      {
        name: 'Vikas Rao',
        email: 'vikas@ebc.com',
        phone: '+919444444444',
        city: 'Chennai',
        state: 'Tamil Nadu',
        coords: [80.2707, 13.0827],
        bloodGroup: 'O-',
        age: 29,
        gender: 'male',
        weight: 68,
        lastDonationDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), // 100 days ago (eligible)
        medicalConditions: ['Mild Asthma']
      },
      {
        name: 'Deepa Sen',
        email: 'deepa@ebc.com',
        phone: '+919555555555',
        city: 'Bangalore',
        state: 'Karnataka',
        coords: [77.5806, 12.9279], // Jayanagar
        bloodGroup: 'A+',
        age: 25,
        gender: 'female',
        weight: 52,
        lastDonationDate: null,
        medicalConditions: []
      }
    ];

    const seededDonors = [];
    for (const d of donorsData) {
      const user = new User({
        name: d.name,
        email: d.email,
        password: 'Donor@123',
        phone: d.phone,
        role: 'donor',
        city: d.city,
        state: d.state,
        location: { type: 'Point', coordinates: d.coords },
        isVerified: true,
        isActive: true
      });
      await user.save();

      // Check eligibility (56-day rule)
      let isEligible = true;
      if (d.lastDonationDate) {
        const diffDays = Math.ceil(Math.abs(new Date() - d.lastDonationDate) / (1000 * 60 * 60 * 24));
        isEligible = diffDays >= 56;
      }

      const donorProfile = new DonorProfile({
        user: user._id,
        bloodGroup: d.bloodGroup,
        age: d.age,
        gender: d.gender,
        weight: d.weight,
        lastDonationDate: d.lastDonationDate,
        isAvailable: true,
        isEligible: isEligible,
        totalDonations: d.lastDonationDate ? 1 : 0,
        medicalConditions: d.medicalConditions,
        city: d.city,
        verifiedBadge: true
      });
      await donorProfile.save();
      seededDonors.push(user);
    }
    console.log(`👤 Seeded ${seededDonors.length} donors and profiles.`);

    // 4. Create Hospitals
    console.log('👤 Seeding Hospital users and profiles...');
    const hospitalsData = [
      {
        name: 'City Care Hospital',
        email: 'citycare@ebc.com',
        phone: '+918022223333',
        city: 'Bangalore',
        state: 'Karnataka',
        coords: [77.5908, 12.9634],
        institutionType: 'hospital',
        address: '12, Richmond Road, Bangalore',
        registrationNumber: 'HOSP-2023-9988',
        verificationStatus: 'verified',
        verifiedBadge: true
      },
      {
        name: 'Lifeline Blood Bank',
        email: 'lifeline@ebc.com',
        phone: '+918022224444',
        city: 'Bangalore',
        state: 'Karnataka',
        coords: [77.6244, 12.9348], // Koramangala
        institutionType: 'blood_bank',
        address: '5th Block, Koramangala, Bangalore',
        registrationNumber: 'BANK-2023-7744',
        verificationStatus: 'verified',
        verifiedBadge: true
      },
      {
        name: 'Grace Clinic',
        email: 'grace@ebc.com',
        phone: '+918022225555',
        city: 'Hyderabad',
        state: 'Telangana',
        coords: [78.4744, 17.3605],
        institutionType: 'clinic',
        address: 'Charminar Road, Hyderabad',
        registrationNumber: 'CLIN-2023-1122',
        verificationStatus: 'pending',
        verifiedBadge: false
      }
    ];

    const seededHospitals = [];
    for (const h of hospitalsData) {
      const user = new User({
        name: h.name,
        email: h.email,
        password: 'Hospital@123',
        phone: h.phone,
        role: 'hospital',
        city: h.city,
        state: h.state,
        location: { type: 'Point', coordinates: h.coords },
        isVerified: h.verificationStatus === 'verified',
        isActive: true
      });
      await user.save();

      const hospitalProfile = new HospitalProfile({
        user: user._id,
        institutionName: h.name,
        institutionType: h.institutionType,
        registrationNumber: h.registrationNumber,
        address: h.address,
        city: h.city,
        state: h.state,
        pincode: '560001',
        contactPerson: 'Dr. John Smith',
        phone: h.phone,
        email: h.email,
        verificationStatus: h.verificationStatus,
        verifiedBadge: h.verifiedBadge,
        website: `www.${h.name.toLowerCase().replace(/ /g, '')}.com`
      });
      await hospitalProfile.save();

      // Seed BloodStock for each hospital (All 8 blood groups)
      const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      for (const bg of bloodGroups) {
        const units = Math.floor(Math.random() * 25) + 2; // 2 to 26 units
        const stock = new BloodStock({
          hospital: user._id,
          bloodGroup: bg,
          availableUnits: units
        });
        await stock.save();
      }

      seededHospitals.push(user);
    }
    console.log(`👤 Seeded ${seededHospitals.length} hospitals and profiles.`);

    // 5. Create BloodRequests
    console.log('🩸 Seeding BloodRequests...');
    const requestsData = [
      {
        patientName: 'Karthik Rao',
        bloodGroup: 'O+',
        unitsRequired: 3,
        urgencyLevel: 'critical',
        hospitalName: 'City Care Hospital',
        hospitalAddress: '12, Richmond Road, Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        coords: [77.5908, 12.9634],
        contactNumber: '+919988776655',
        isSOSRequest: true,
        status: 'pending',
        additionalNotes: 'Severe internal bleeding due to car accident. Need O+ urgently.'
      },
      {
        patientName: 'Ananya Sharma',
        bloodGroup: 'AB-',
        unitsRequired: 1,
        urgencyLevel: 'urgent',
        hospitalName: 'Lifeline Blood Bank',
        hospitalAddress: '5th Block, Koramangala, Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        coords: [77.6244, 12.9348],
        contactNumber: '+919876543211',
        isSOSRequest: false,
        status: 'pending',
        additionalNotes: 'Planned bypass surgery scheduled in 2 days.'
      },
      {
        patientName: 'Vikram Seth',
        bloodGroup: 'B+',
        unitsRequired: 2,
        urgencyLevel: 'moderate',
        hospitalName: 'Hyderabad General Hospital',
        hospitalAddress: 'Nampally, Hyderabad',
        city: 'Hyderabad',
        state: 'Telangana',
        coords: [78.4867, 17.3850],
        contactNumber: '+919000000001',
        isSOSRequest: false,
        status: 'accepted',
        acceptedByDonorIdx: 2, // John Doe is index 2
        additionalNotes: 'Routine dialysis patient requires blood.'
      },
      {
        patientName: 'Latha Reddy',
        bloodGroup: 'A+',
        unitsRequired: 4,
        urgencyLevel: 'critical',
        hospitalName: 'Apollo Hospital',
        hospitalAddress: 'Bannerghatta Road, Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        coords: [77.5975, 12.8953],
        contactNumber: '+919100000002',
        isSOSRequest: true,
        status: 'completed',
        acceptedByDonorIdx: 4, // Deepa Sen is index 4
        additionalNotes: 'Dengue patient with dropping platelet counts.'
      },
      {
        patientName: 'Susheel George',
        bloodGroup: 'O-',
        unitsRequired: 2,
        urgencyLevel: 'normal',
        hospitalName: 'Grace Clinic',
        hospitalAddress: 'Charminar Road, Hyderabad',
        city: 'Hyderabad',
        state: 'Telangana',
        coords: [78.4744, 17.3605],
        contactNumber: '+919200000003',
        isSOSRequest: false,
        status: 'cancelled',
        additionalNotes: 'Patient discharged. Request no longer active.'
      }
    ];

    for (const r of requestsData) {
      const acceptedBy = [];
      if (r.acceptedByDonorIdx !== undefined) {
        acceptedBy.push(seededDonors[r.acceptedByDonorIdx]._id);
      }

      const request = new BloodRequest({
        seeker: seeker._id,
        patientName: r.patientName,
        bloodGroup: r.bloodGroup,
        unitsRequired: r.unitsRequired,
        urgencyLevel: r.urgencyLevel,
        hospitalName: r.hospitalName,
        hospitalAddress: r.hospitalAddress,
        city: r.city,
        state: r.state,
        location: { type: 'Point', coordinates: r.coords },
        contactNumber: r.contactNumber,
        isSOSRequest: r.isSOSRequest,
        status: r.status,
        acceptedBy,
        additionalNotes: r.additionalNotes,
        deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days deadline
      });
      await request.save();

      // If request was completed, seed donation history record
      if (r.status === 'completed') {
        const donationHistory = new DonationHistory({
          donor: seededDonors[r.acceptedByDonorIdx]._id,
          request: request._id,
          seeker: seeker._id,
          hospitalName: r.hospitalName,
          bloodGroup: r.bloodGroup,
          unitsDonated: r.unitsRequired,
          donationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // completed 5 days ago
          status: 'completed'
        });
        await donationHistory.save();

        // Update Donor profile totalDonations
        const profile = await DonorProfile.findOne({ user: seededDonors[r.acceptedByDonorIdx]._id });
        if (profile) {
          profile.totalDonations += 1;
          profile.lastDonationDate = donationHistory.donationDate;
          // Set eligibility false since it was 5 days ago
          profile.isEligible = false;
          await profile.save();
        }
      }
    }
    console.log('🩸 Seeded BloodRequests and related DonationHistory.');

    // 6. Seed Sample Notifications
    console.log('🔔 Seeding Sample Notifications...');
    const samples = [
      {
        recipient: seededDonors[0]._id, // Amit Kumar
        title: '🚨 Emergency Blood Alert in your City!',
        message: 'A critical SOS request for O+ blood in Bangalore was submitted. Please check active requests!',
        type: 'sos_alert'
      },
      {
        recipient: seededHospitals[0]._id, // City Care Hospital
        title: 'New Verification Request Submitted',
        message: 'Your profile registration has been successfully verified. Welcome to the coordinate portal!',
        type: 'verification'
      }
    ];

    for (const item of samples) {
      const n = new Notification({
        recipient: item.recipient,
        title: item.title,
        message: item.message,
        type: item.type,
        isRead: false
      });
      await n.save();
    }
    console.log('🔔 Notifications seeded.');

    console.log('🚀 DATABASE SEED COMPLETED SUCCESSFULLY! 🚀');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error seeding database: ${error.stack}`);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDB();
